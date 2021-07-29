import { Button, Form, Input } from "semantic-ui-react";

export default function WethWrap(props) {
  return (
    <Form style={{ width: "90%", marginRight: "auto", marginLeft: "auto" }}>
      <Form.Group>
        <Form.Field inline>
          {/* <div>{nwConfig[currentChain].wethContractAddr}</div> */}
          <label>ETH Amount</label>
          <Input placeholder="Amount" onChange={props.ethInputAmt} />
        </Form.Field>
        <Button onClick={props.ethToWeth}>Convert</Button>
      </Form.Group>
    </Form>
  );
}
