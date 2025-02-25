const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('VaultToken contract (simple test)', () => {
    let VaultToken, TestToken, Factory, vaultToken, testToken, manager, depositor, fake_addressBook, fake_controller, fake_airswap;

    before(async () => {
        TestToken = await ethers.getContractFactory('TestToken');
        Factory = await ethers.getContractFactory('Factory');
        VaultToken = await ethers.getContractFactory('VaultToken');
        [deployer, manager, depositor, fake_addressBook, fake_controller, fake_airswap] = await ethers.getSigners();

        vaultToken = await VaultToken.deploy();

        await vaultToken.initialize(
            "INIT",
            "INIT",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            0,
            0
        );

        testToken = await TestToken.connect(depositor).deploy(
            "Mock Asset",
            "MOCK",
            6,
            100000e6
        );
        factory = await Factory.connect(deployer).deploy(
            fake_airswap.address,
            fake_addressBook.address,
            vaultToken.address,
            deployer.address
        );

        vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
            "Vault",
            "VAULT",
            testToken.address,
            86400, // 1 day
            500e6
        );

        const receipt = await vaultTokenTransaction.wait();

        vaultToken = await ethers.getContractAt(
            'VaultToken',
            receipt.events[0].args.vaultToken,
            manager
        );
        
    });

    describe("Verify Depositor's Balance", () => {
        it('Depositor should own the asset supply', async () => {
            const depositorBalance = await testToken.balanceOf(depositor.address);
            expect(await testToken.totalSupply()).to.equal(depositorBalance);
        });
        it('Depositor should give 1 MOCK', async () => {
            await testToken.connect(depositor).transfer(manager.address, 1e6);
            const managerBalance = await testToken.balanceOf(manager.address);
            expect(managerBalance).to.equal(1e6);
        });
    });

    describe("Initialize the Vault", () => {
        it('Should revert for zero-value asset transfer (dust safety check)', async () => {
            await expect(
                vaultToken.connect(manager).deposit(1)
            ).to.be.reverted;
        });
        it('Ratio should be initialized', async () => {
            await testToken.connect(manager).approve(vaultToken.address, 1e6);
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('1', 6));

            const vaultTokenSupply = await vaultToken.totalSupply();
            const vaultBalance = await testToken.balanceOf(vaultToken.address);

            expect(vaultTokenSupply).to.equal(ethers.utils.parseUnits('1', 18));
            expect(vaultBalance).to.equal(1e6);
        });
    });

    describe("Depositor interaction (1:1 ratio)", () => {
        it('Should receive 1e18 vault tokens for 1e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 1e6);
            await vaultToken.connect(depositor).deposit(1e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(2e6);
        });
        it('Should receive 1e6 test tokens for burning 1e18 (withdrawal)', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1e6);
        });
        it('Should receive 100e18 vault tokens for 100e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('100', 6));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('100', 6));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('100', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('101', 6));
        });
        it('Should receive 100e6 test tokens for 100e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('100', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1e6);
        });
    });

    describe("Depositor interaction (1:2 ratio)", () => {
        before(async () => {
            await testToken.connect(depositor).rugPull(0.5e6, vaultToken.address);
        });
        it('Should receive 1e18 vault tokens for 0.5e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 0.5e6);
            await vaultToken.connect(depositor).deposit(0.5e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1e6);
        });
        it('Should receive 0.5e6 test tokens for 1e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18));
            
            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(0.5e6);
        });
    });

    describe("Depositor interaction (2:1 ratio)", () => {
        before(async () => {
            await testToken.connect(depositor).transfer(vaultToken.address, 1.5e6);
        });
        it('Should receive 0.5e18 vault tokens for 1e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 1e6);
            await vaultToken.connect(depositor).deposit(1e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('0.5', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(3e6);
        });
        it('Should receive 1e6 test tokens for 0.5e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('0.5', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(2e6);
        });
    });

    describe("Depositor interaction (1:4 ratio)", () => {
        before(async () => {
            await testToken.connect(depositor).rugPull(1.75e6, vaultToken.address);
        });
        it('Should receive 4e18 vault tokens for 1e6 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, 1e6);
            await vaultToken.connect(depositor).deposit(1e6);

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(ethers.utils.parseUnits('4', 18));
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(1.25e6);
        });
        it('Should receive 1e6 test tokens for 4e18 vault tokens', async () => {
            await vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('4', 18));

            expect(await vaultToken.balanceOf(depositor.address)).to.equal(0);
            expect(await testToken.balanceOf(vaultToken.address)).to.equal(0.25e6);
        });
    });

    describe("Depositor interaction (20 decimal test token)", () => {
        before(async () => {
            testToken = await TestToken.connect(depositor).deploy(
                "Mock Asset",
                "MOCK",
                20,
                ethers.utils.parseUnits('100000', 20)
            );
            vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
                "Vault",
                "VAULT",
                testToken.address,
                86400, // 1 day
                ethers.utils.parseUnits('500', 20)
            );
    
            const receipt = await vaultTokenTransaction.wait();
    
            vaultToken = await ethers.getContractAt(
                'VaultToken',
                receipt.events[0].args.vaultToken,
                manager
            );

            await testToken.connect(depositor).transfer(manager.address, ethers.utils.parseUnits('1', 20));
        });

        it('Should initialize the vault correctly', async () => {
            await testToken.connect(manager).approve(vaultToken.address, ethers.utils.parseUnits('1', 20));
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('1', 20));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 20));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 1e18 vault tokens for 1e20 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 20));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 20));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('2', 20));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('2', 18));
        });
    });

    describe("Depositor interaction (18 decimal test token)", () => {
        before(async () => {
            testToken = await TestToken.connect(depositor).deploy(
                "Mock Asset",
                "MOCK",
                18,
                ethers.utils.parseUnits('100000', 18)
            );
            vaultTokenTransaction = await factory.connect(manager).deployNewVaultToken(
                "Vault",
                "VAULT",
                testToken.address,
                86400, // 1 day
                ethers.utils.parseUnits('500', 18)
            );
    
            const receipt = await vaultTokenTransaction.wait();
    
            vaultToken = await ethers.getContractAt(
                'VaultToken',
                receipt.events[0].args.vaultToken,
                manager
            );

            await testToken.connect(depositor).transfer(manager.address, ethers.utils.parseUnits('1', 18));
        });

        it('Should initialize the vault correctly', async () => {
            await testToken.connect(manager).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(manager).deposit(ethers.utils.parseUnits('1', 18));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('1', 18));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('1', 18));
        });
        it('Should receive 1e18 vault tokens for 1e18 test tokens', async () => {
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            await vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18));

            expect(await testToken.balanceOf(vaultToken.address)).to.equal(ethers.utils.parseUnits('2', 18));
            expect(await vaultToken.totalSupply()).to.equal(ethers.utils.parseUnits('2', 18));
        });
    });

    describe("Pausable test", () => {
        before(async () => {
            await vaultToken.connect(manager).emergency(true);
        });
        it('Should not allow anything to occur', async () => {
            await expect(
                vaultToken.connect(depositor).deposit(1e6)
            ).to.be.revertedWith("Pausable: paused");
            await expect(
                vaultToken.connect(depositor).withdraw(ethers.utils.parseUnits('1', 18))
            ).to.be.revertedWith("Pausable: paused");
            await expect(
                vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18))
            ).to.be.revertedWith("Pausable: paused");
        });
        it('Should allow something to occur', async () => {
            await vaultToken.connect(manager).emergency(false);
            await testToken.connect(depositor).approve(vaultToken.address, ethers.utils.parseUnits('1', 18));
            
            await expect(
                vaultToken.connect(depositor).deposit(ethers.utils.parseUnits('1', 18))
            ).to.not.be.reverted;
        });
    });

});