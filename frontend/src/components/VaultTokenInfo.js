import { useState, useEffect } from "react";
import StatusMessage from "./StatusMessage";
import { nwConfig, currentChain } from "./NetworkConfig";

import {
  Header,
  Button,
  Grid,
  Divider,
  Icon,
  Form,
  Accordion,
  Menu,
  Dropdown,
} from "semantic-ui-react";
import { web3 } from "./Web3Handler";
import WethWrap from "./WethWrap";
import Withdraw from "./Withdraw";
import Deposit from "./Deposit";
import styled from "styled-components";
import { VaultToken } from "./VaultToken";
import { ERC20 } from "./Erc20";
import { type } from "os";

const DWIndicator = styled.div`
  display: flex;
  flex-direction: row;
  width: 80%;
  height: 60px;

  margin-left: auto;
  margin-right: auto;
`;
const DIndicator = styled.div`
  padding-top: 17px;
  border-radius: 0px 20px 0 0;
  background-color: #9aa9ff63;
  width: 50%;
  text-align: center;
  cursor: pointer;
  border-top: 1px solid black;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  font-size: 20px;
  font-weight: 700;
  &:hover {
    background-color: #663a82;
    color: white;
  }
`;
const WIndicator = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 20px 0px 0 0;
  background-color: #9aa9ff63;
  width: 50%;
  text-align: center;
  border-right: 1px solid black;
  border-top: 1px solid black;
  border-right: 1px solid black;
  border-left: 1px solid black;
  border-bottom: 1px solid black;
  font-size: 20px;
  font-weight: 700;
  &:hover {
    background-color: #663a82;
    color: white;
  }
`;

const MagmrCallsIndicator = styled.div`
  display: flex;
  flex-direction: row;
  width: 80%;
  height: 60px;

  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
`;

const DWForm = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 0 0 20px 20px;
  border: 1px solid black;
  background-color: #9aa9ff63;
  padding-bottom: 50px;
`;
const MgmrCallForm = styled.div`
  width: 80%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 20px;
  // border-radius: 0 0 20px 20px;
  border: 1px solid black;
  background-color: #9aa9ff63;
  padding-bottom: 50px;
`;

const ManagerTXBtns = styled.div`
  width: 80%;
  display: flex;
  flex-direction: row;
`;
const WriteBtn = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 20px 0px 0 20px;
  background-color: #146ca4;
  width: 50%;
  text-align: center;
  border-top: 1px solid black;
  border-left: 1px solid black;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  &:hover {
    background-color: purple;
  }
`;
const SellCallBtn = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 0px 0px 0 0;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  background-color: #146ca4;
  width: 50%;
  text-align: center;
  &:hover {
    background-color: purple;
  }
`;
const SettleVaultBtn = styled.div`
  padding-top: 17px;
  cursor: pointer;
  border-radius: 0px 20px 20px 0;

  background-color: #146ca4;
  border-top: 1px solid black;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  width: 50%;
  text-align: center;
  &:hover {
    background-color: purple;
  }
`;
const ConfirmCancelBtns = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;
export default function VaultTokenInfo(props) {
  let ct = JSON.parse(localStorage.getItem("cVT") || "{}");
  let ctAddr = ct.address;
  const [cVT, setcVT] = useState();
  const [depositAmt, setDeposit] = useState(0);
  const [withdrawAmt, setWithdrawAmt] = useState(0);

  const [oTokenAddress, setOTokenaddress] = useState("");
  const [writeCallAmt, setWriteCallAmt] = useState(0);
  const [writeCallPcent, setWriteCallPcent] = useState(0);
  const [writeSellOptionAmt, setWriteSellOptionAmt] = useState(0);
  const [writeSellOptionPcent, setWriteSellOptionPcent] = useState(0);
  const [typeHash, setTypeHash] = useState("");
  const [asHash, setASHash] = useState({});

  const [showWriteCall, setShowWriteCall] = useState(false);
  const [showWriteSellOption, setShowWriteSellOption] = useState(false);
  const [showSellCall, setShowSellCall] = useState(false);
  const [writeColor, setWriteColor] = useState("teal");
  const [sellColor, setSellColor] = useState("teal");
  const [settleColor, setSettleColor] = useState("teal");

  const [statusMessage, setStatusMessage] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [statusHeader, setStatusHeader] = useState("");
  const [statusError, setStatusError] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [iconStatus, setIconStatus] = useState("loading");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [managerClick, setManagerClick] = useState(false);

  //=======texting for eth to weth
  const [eToWethAmt, setEToWethAmt] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showD, setShowD] = useState(false);
  const [showW, setShowW] = useState(true);
  const [onAmt, setOnAmt] = useState(1);

  useEffect(() => {
    createVT(ctAddr, ctAddr);
  }, []);

  function createVT(va, aa) {
    let t = new VaultToken(web3, va);
    let a = new ERC20(web3, aa);
    t.assetObject = a;
    setcVT(t);
  }

  async function getTypeHash() {
    const typeUrlPrefix = await "https://dweb.link/ipfs/";
    const typeUrl = await (typeUrlPrefix + typeHash);
    console.log(typeUrl);
    fetch(typeUrl)
      .then((response) => {
        response.json();
      })
      .then((result) => {
        setASHash(result);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function sellOptions(e) {
    if (typeHash === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }

    console.log("atsell");
    getTypeHash();
    startTX();
    e.preventDefault();
    let s = cVT.sellOptions(asHash);
    sendTX(s, "Settle Vault");
  }

  function ethInputAmt(event) {
    if (event.target.value > props.ethBal) {
      setSM("Error", "Not enough ether", true, true);
      setIconStatus("error");
      return;
    }
    setEToWethAmt(event.target.value);
  }

  function ethToWeth(a) {
    if (a === 0) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }
    let amount = web3.utils.toWei(a, "ether");
    let e = web3.eth.sendTransaction({
      from: props.acct,
      to: nwConfig[currentChain].wethContractAddr,
      value: amount,
    });
    sendTX(e, "Converting to WETH");
  }

  //========ending
  function setSM(h, m, s, e) {
    setStatusHeader(h);
    setStatusMessage(m);
    setShowStatus(s);
    setStatusError(e);
  }

  function sendTX(c, label) {
    c.on("transactionHash", function (hash) {
      setTxHash(hash);
      setSM("TX Hash Received", hash, true, false);
    })
      .on("error", function (error, receipt) {
        let m = "";
        if (error !== null) {
          let i = error.message.indexOf(":");
          m = error.message.substring(0, i > 0 ? i : 40);
        }
        setSM(label + " TX Error", m, true, true);
        setTxSent(false);
        setIconStatus("error");
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        if (confirmationNumber === 1) {
          setSM(label + " TX Confirmed", "Confirmation Received", true, false);
          setIconStatus("confirmed");
        }
      });
  }

  function overAmount(a, b, c) {
    c = c * 1e18;
    if (a > b + c) {
      setSM("Error", "You don't have enough balance", true, true);
      setIconStatus("error");
      return;
    } else if (a > b && a < b + c) {
      setSM(
        "Error",
        `You need to convert ${(a - b) / 1e18} ETH to WETH`,
        true,
        true
      );
      setIconStatus("error");
      return;
    }
  }

  function deposit(amt) {
    console.log(props);
    startTX();
    if (amt === 0 || isNaN(amt)) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }
    // let amount = web3.utils.toWei(amt, dUnit);
    let amount = web3.utils.toWei(amt, "ether");
    cVT
      .approveAsset(amount, props.acct)
      .on("transactionHash", function (hash) {
        setTxHash(hash);
        setSM("TX Hash Received", hash, true, false);
      })
      .on("error", function (error, receipt) {
        let m = "";
        if (error !== null) {
          let i = error.message.indexOf(":");
          m = error.message.substring(0, i > 0 ? i : 40);
        }
        setSM(" TX Error", m, true, true);
        setTxSent(false);
        setIconStatus("error");
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        if (confirmationNumber === 1) {
          let i = cVT.deposit(amount, props.acct);
          sendTX(i, "deposit");
          setSM("Approval TX Confirmed", "Confirmation Received", true, false);

          setIconStatus("confirmed");
        }
      });
  }

  function withDraw(amt) {
    startTX();

    if (amt === 0 || isNaN(amt)) {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");
      return;
    }

    // let amount = web3.utils.toWei(amt, wUnit);
    let amount = web3.utils.toWei(amt, "ether");
    let w = cVT.withdraw(amount, props.acct);
    sendTX(w, "Withdraw");
  }

  function settleVault() {
    startTX();
    let s = cVT.settleVault(props.acct);
    sendTX(s, "Settle Vault");
  }

  function writeCallAmtF(amt, oTAddress) {
    startTX();
    //  let amount = web3.utils.toWei(amt, writeCallUnit);
    let amount = web3.utils.toWei(amt, "ether");
    let wc = cVT.writeOptionsAmt(amount, oTAddress, props.acct);
    sendTX(wc, "Write Call");
  }

  function writeCallPcentF(pcent, oTAddress) {
    startTX();

    let wc = cVT.writeOptionsPcent(pcent, oTAddress, props.acct);
    sendTX(wc, "Write Call");
  }

  function writeSellOptionsAmt(pcent, oTAddress, order) {
    startTX();

    let wc = cVT.writeAndSellOptionsAmt(pcent, oTAddress, order, props.acct);
    sendTX(wc, "Write and sell ");
  }

  function writeSellOptionsPcent(pcent, oTAddress, order) {
    startTX();

    let wc = cVT.writeAndSellOptionsPcent(pcent, oTAddress, order, props.acct);
    sendTX(wc, "Write and sell");
  }

  function comfirmWriteSellOptionsPcent(e) {
    startTX();
    e.preventDefault();
    if (writeCallAmt === 0 || oTokenAddress === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }

    writeSellOptionsPcent(writeCallAmt, oTokenAddress, asHash);
  }
  function comfirmWriteSellOptionsAmt(e) {
    startTX();
    e.preventDefault();
    if (writeCallAmt === 0 || oTokenAddress === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }
    getTypeHash();
    writeSellOptionsAmt(writeCallAmt, oTokenAddress, asHash);
  }

  function confirmWriteCallAmt(e) {
    startTX();
    e.preventDefault();
    if (writeCallAmt === 0 || oTokenAddress === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }

    writeCallAmtF(writeCallAmt, oTokenAddress);
  }
  function confirmWriteCallPcent(e) {
    startTX();
    e.preventDefault();
    if (writeCallPcent === 0 || oTokenAddress === "") {
      setSM("Error", "Form input Error", true, true);
      setIconStatus("error");

      return;
    }

    writeCallPcentF(writeCallPcent, oTokenAddress);
  }

  function startTX() {
    setBtnDisabled(true);
    setSM("MetaMask", "Sending Transaction", true, false);
    setTxSent(true);
  }

  // function disableAllInput() {}
  function resetForm() {
    setBtnDisabled(false);
    setIconStatus("loading");
    setShowStatus(false);
  }

  function handleConvert(e, titleProps) {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;

    setActiveIndex(newIndex);
  }

  function overPcent(a) {
    if (a > 100) {
      setSM("Error", "You cannot enter number over 100", true, true);
      setIconStatus("error");
      return;
    }
  }

  function convertForm() {
    return (
      <div style={{ textAlign: "center" }}>
        <Accordion>
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={handleConvert}
          >
            <Icon name="dropdown" />
            ETH <Icon name="long arrow alternate right" /> WETH Wrapper
          </Accordion.Title>
          {/* {showConvertModal && ( */}

          <Accordion.Content active={activeIndex === 0}>
            <p>
              <WethWrap
                acct={props.acct}
                ethInputAmt={ethInputAmt}
                ethToWeth={() => ethToWeth(eToWethAmt)}
                eToWethAmt={eToWethAmt}
                ethBal={props.ethBal}
              />
              {/* )} */}
            </p>
          </Accordion.Content>
        </Accordion>
      </div>
    );
  }

  const options = [
    { key: 1, text: props.token.assetObject.tSymbol, value: 1 },
    { key: 2, text: "%", value: 2 },
  ];

  function writeCallRender() {
    return (
      <MgmrCallForm>
        <Form>
          <Divider hidden />

          <Form.Group
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "30px",
              marginBottom: "50px",
              justifyContent: "center",
            }}
          >
            {/* <div style={{ marginTop: "10px" }}>Amount</div> */}

            <input
              style={{
                width: " 60%",
                marginLeft: "15px",
                marginRight: "15px",
              }}
              // onChange={(e) => setWriteCallAmt(e.target.value)}
              onChange={(e) => {
                if (e.target.value > 0) {
                  if (onAmt === 1) {
                    let a = web3.utils.toWei(e.target.value, "ether");
                    overAmount(
                      a,
                      props.token.assetObject.myBalance,
                      props.ethBal
                    );
                    console.log(onAmt);
                    setWriteCallAmt(e.target.value);
                  } else {
                    let a = e.target.value;
                    overPcent(a);
                    setWriteCallPcent(e.target.value);
                  }
                }
              }}
            />
            <Dropdown
              item
              simple
              direction="right"
              compact
              selection
              options={options}
              style={{ width: "80px" }}
              onChange={async (e, data) => {
                console.log(data.value);
                await setOnAmt(data.value);
                console.log(onAmt);
              }}
            />

            {/* <div style={{ marginTop: "10px" }}>
              {props.token.assetObject.tSymbol}
            </div> */}
          </Form.Group>

          <Form.Field
            style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}
          >
            <label>oToken Address</label>
            <input
              value={oTokenAddress}
              onChange={(e) => setOTokenaddress(e.target.value)}
            />
          </Form.Field>

          <ConfirmCancelBtns>
            <Button
              style={{ width: "40%" }}
              color="teal"
              onClick={
                onAmt === 1 ? confirmWriteCallAmt : confirmWriteCallPcent
              }
              disabled={btnDisabled}
            >
              Write Call
            </Button>
            <Button
              style={{ width: "40%" }}
              onClick={() => {
                setShowWriteCall(false);
                setSM("", "", false, false);
                setTxHash("");
                setTxSent(false);
                setSellColor("teal");
                setSettleColor("teal");
                setManagerClick(false);
              }}
              disabled={btnDisabled}
            >
              Cancel
            </Button>
          </ConfirmCancelBtns>
        </Form>
      </MgmrCallForm>
    );
  }

  function renderWriteSellOptions() {
    return (
      <MgmrCallForm>
        <Form>
          <Divider hidden />
          <Form.Group
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "30px",
              marginBottom: "50px",
              justifyContent: "center",
            }}
          >
            {/* <div style={{ marginTop: "10px" }}>Amount</div> */}

            <input
              style={{
                width: " 60%",
                marginLeft: "15px",
                marginRight: "15px",
              }}
              // onChange={(e) => setWriteCallAmt(e.target.value)}
              onChange={(e) => {
                if (e.target.value > 0) {
                  if (onAmt === 1) {
                    let a = web3.utils.toWei(e.target.value, "ether");
                    overAmount(
                      a,
                      props.token.assetObject.myBalance,
                      props.ethBal
                    );
                    setWriteSellOptionAmt(e.target.value);
                  } else {
                    let a = e.target.value;
                    overPcent(a);
                    setWriteSellOptionPcent(e.target.value);
                  }
                }
              }}
            />
            <Dropdown
              item
              simple
              direction="right"
              compact
              selection
              options={options}
              style={{ width: "80px" }}
              onChange={(e, data) => setOnAmt(data.value)}
            />

            {/* <div style={{ marginTop: "10px" }}>
              {props.token.assetObject.tSymbol}
            </div> */}
          </Form.Group>
          <Form.Field
            style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}
          >
            <label>TX Hash</label>
            <input
              value={typeHash}
              onChange={(e) => setTypeHash(e.target.value)}
            />
          </Form.Field>
          <ConfirmCancelBtns>
            {" "}
            <Button
              style={{ width: "40%" }}
              color="teal"
              onClick={
                onAmt === 1
                  ? comfirmWriteSellOptionsAmt
                  : comfirmWriteSellOptionsPcent
              }
              disabled={btnDisabled}
            >
              Write Sell Option{" "}
            </Button>
          </ConfirmCancelBtns>
        </Form>
      </MgmrCallForm>
    );
  }

  function renderSellCall() {
    return (
      <MgmrCallForm>
        <Form>
          <Divider hidden />
          <Form.Field
            style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}
          >
            <label>TX Hash</label>
            <input
              value={typeHash}
              onChange={(e) => setTypeHash(e.target.value)}
            />
          </Form.Field>
          <ConfirmCancelBtns>
            {" "}
            <Button
              style={{ width: "40%" }}
              color="teal"
              onClick={sellOptions}
              disabled={btnDisabled}
            >
              Sell Call
            </Button>
          </ConfirmCancelBtns>
        </Form>
      </MgmrCallForm>
    );
  }

  function managerMenu() {
    return (
      <div>
        <Divider hidden />
        <MagmrCallsIndicator>
          <WriteBtn
            labelPosition="right"
            color={writeColor}
            onClick={() => {
              setShowWriteCall(true);
              setWriteColor("teal");
              setShowWriteSellOption(false);

              setShowSellCall(false);
              setSellColor("grey");
              setSettleColor("grey");
              setManagerClick(true);
            }}
            disabled={btnDisabled}
          >
            Write Call
          </WriteBtn>

          <SellCallBtn
            color={sellColor}
            labelPosition="right"
            onClick={() => {
              setShowSellCall(true);
              setShowWriteCall(false);
              setShowWriteSellOption(false);
              setSellColor("teal");
              setWriteColor("grey");
              setSettleColor("grey");
              setManagerClick(true);
            }}
            disabled={btnDisabled}
          >
            Sell Call
          </SellCallBtn>
          <SellCallBtn
            labelPosition="right"
            color={writeColor}
            onClick={() => {
              setShowWriteSellOption(true);
              setWriteColor("teal");
              setShowSellCall(false);
              setShowWriteCall(false);
              setSellColor("grey");
              setSettleColor("grey");
              setManagerClick(true);
            }}
            disabled={btnDisabled}
          >
            Write Call Option
          </SellCallBtn>
          <SettleVaultBtn
            color={settleColor}
            onClick={settleVault}
            disabled={btnDisabled}
          >
            Settle Vault
          </SettleVaultBtn>
        </MagmrCallsIndicator>

        {showWriteCall && writeCallRender()}
        {showSellCall && renderSellCall()}
        {showWriteSellOption && renderWriteSellOptions()}
      </div>
    );
  }

  function updateWDAmt(e) {
    setWithdrawAmt(e.target.value);
  }

  function updateDAmt(e) {
    if (e.target.value > 0) {
      let a = web3.utils.toWei(e.target.value, "ether");
      overAmount(a, props.token.assetObject.myBalance, props.ethBal);
    }
    setDeposit(e.target.value);
  }
  function clickShowD() {
    setShowD(true);
    setShowW(false);
  }
  function clickShowW() {
    setShowD(false);
    setShowW(true);
  }
  function showTokenPair() {
    console.log(props.token.assetObject);
    return (
      <>
        <DWIndicator>
          <WIndicator onClick={() => clickShowW()}>Withdraw</WIndicator>
          <DIndicator onClick={() => clickShowD()}>Deposit</DIndicator>
        </DWIndicator>
        {!showD ? (
          <DWForm>
            <Withdraw
              token={props.token}
              withDraw={withDraw}
              withdrawAmt={withdrawAmt}
              updateWDAmt={updateWDAmt}
              managerClick={managerClick}
              btnDisabled={btnDisabled}
            />
          </DWForm>
        ) : (
          <DWForm>
            <Deposit
              token={props.token}
              deposit={deposit}
              depositAmt={depositAmt}
              updateDAmt={updateDAmt}
              managerClick={managerClick}
              btnDisabled={btnDisabled}
            />
          </DWForm>
        )}
      </>
    );
  }
  return (
    <div>
      {showStatus && (
        <Grid>
          <Grid.Column width={16}>
            <StatusMessage
              statusHeader={statusHeader}
              statusMessage={statusMessage}
              statusError={statusError}
              txHash={txHash}
              iconStatus={iconStatus}
              resetForm={resetForm}
              iconStatus={iconStatus}
            />
          </Grid.Column>
          {/* <Grid.Column width={2} verticalAlign="middle">
            {iconStatus !== "loading" && (
              <Button onClick={resetForm} icon="check" circular />
            )}
          </Grid.Column> */}
        </Grid>
      )}
      {/* {showConvertForm && convertForm()} */}
      <Divider hidden />
      <Divider hidden />
      {props.token.totalSupply !== 0 && showTokenPair()}

      {props.token.manageToken && managerMenu()}
      <Divider hidden />
      {props.token.assetObject.tSymbol === "WETH" && convertForm()}
    </div>
  );
}

// {props.token.vaultBalance > 0 && showRatio()}
