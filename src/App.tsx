import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";

function App() {
  function handClickRegister() {
    alert("the author have registered!");
  }
  function handClickUpload() {
    alert("upload file");
  }

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Sui Write3 Demo</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          {/* <WalletStatus /> */}
          <Box mt="4">
            <div>register author</div>
          </Box>
          <Flex mt="4">
            <input id="author" type="text" placeholder="author name" className="form-control" required />
          </Flex>
          <Flex mt="4">
            <button id="register" className="btn btn-primary" onClick={handClickRegister}>
              Regitster
            </button>
          </Flex>
          <Box>
            <div>selet novel files</div>
            <Flex my="4">
              <input id="file-input" type="file" className="form-control" required />
            </Flex>

            <div>
              <button id="submit" className="btn btn-primary" onClick={handClickUpload}>
                <span id="submit-spinner" className="spinner-border spinner-border-sm"
                  aria-hidden="true" ></span>
                <span id="submit-text" role="status">Upload</span>
              </button>
            </div>

          </Box>
        </Container>
      </Container>
    </>
  );
}

export default App;
