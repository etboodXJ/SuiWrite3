import { ConnectButton, useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClientInfiniteQuery, useSuiClientQuery } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
// import { Transaction } from "@mysten/sui/transactions";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";
import { CompAuthorList } from './CompAuthorList';
import LowString from "./LowString";
import { useNetworkVariable } from "./networkConfig";
import { useMemo, useState } from "react";
import { SuiEvent } from "@mysten/sui.js/client";
import authorRoomEventHook from "./hooks/authorRoomEventHook";

function App() {
  const account = useCurrentAccount();
  const write3PackageId = useNetworkVariable("write3PackageId");
  console.log("write3PackageId", write3PackageId);

  const PACKAGE_ID = write3PackageId;
  const MODULE_NAME = "write3";
  const CREATE_FUNCTION_NAME = "createAuthor";
  const AuthorRoom_ID = "0xccd79d4607959269f25f9b76de573e8d93b7b3240c68d37550c69efd9a81f18c";
  const AuthorRoomCreateEvent = "AuthorRoomCreateEvent";

  const { authorRoomEvents, authorRoomID } = authorRoomEventHook(PACKAGE_ID, MODULE_NAME, AuthorRoomCreateEvent);

  if (authorRoomID) {

    console.log('authorRoomID', authorRoomID);

  }

  const [AuthorName, setAuthorName] = useState('author');

  // 处理输入变化的函数
  const handleInputChange = (event: { target: { value: any; }; }) => {
    const { value } = event.target;
    // 检查输入长度是否超过20个字符
    if (value.length <= 20) {
      setAuthorName(value);
    } else {
      // 设置为20个字符
      setAuthorName(value.substring(0, 20));
    }
  };

  const { mutate: signAndExecuteTransaction } =
    useSignAndExecuteTransactionBlock();

  function handClickRegister() {
    if (!account) {
      alert("please connect wallet");
      return;
    }

    let txb = new TransactionBlock();
    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${CREATE_FUNCTION_NAME}`,
      arguments: [
        txb.object(AuthorRoom_ID),
        txb.pure.string(AuthorName),
        txb.pure.bool(false),
        txb.pure.u64(0),
      ],
    });

    txb.setSender(account!.address);

    signAndExecuteTransaction(
      {
        transactionBlock: txb,
        options: {
          showObjectChanges: true,
        },
      },
      {
        async onSuccess(data: any) {
          console.log("create success");
          console.log(data);
          alert("create success");

        },
        onError() {
          console.log("create error");
          alert("create error");

        },
      }
    );
  }

  function handClickCreate() {
    alert("the author have registered!");
  }
  function handClickUpload() {
    alert("upload file");
  }


  function onSubmit(event: any) {
    event.preventDefault();
    enableForm(false);
    console.log('Form submitted');

    // Store and display the blob, then re-enable the form.
    storeBlob().then((storageInfo) => {
      displayUpload(storageInfo.info, storageInfo.media_type);
      console.log("storageInfo", storageInfo);
      enableForm(true);
    }).catch((error) => {
      console.error(error);
      alert(
        "An error occurred while uploading. Check the browser console and ensure that \
          the aggregator and publisher URLs are correct."
      );
      enableForm(true);
    });

  }

  function storeBlob() {
    const inputElement = document.getElementById("file-input") as HTMLInputElement;
    if (inputElement) {
      const inputFile = inputElement.files?.[0];
      const numEpochs = 5;
      const basePublisherUrl = "https://publisher-devnet.walrus.space";
      // Submit a PUT request with the file's content as the body to the /v1/store endpoint.
      return fetch(`${basePublisherUrl}/v1/store?epochs=${numEpochs}`, {
        method: "PUT",
        body: inputFile,
      }).then((response) => {
        if (response.status === 200) {
          return response.json().then((info) => {
            console.log(info);
            return { info: info, media_type: inputFile?.type };
          });
        } else {
          throw new Error("Something went wrong when storing the blob!");
        }
      })
    } else {
      // 如果没有找到元素，返回一个被拒绝的 Promise
      return Promise.reject(new Error("File input element not found."));
    }
  }

  function enableForm(isEnabled: boolean) {
    if (isEnabled) {
    }
    else {
    }
  }

  const SUI_NETWORK = "testnet";
  const SUI_VIEW_TX_URL = `https://suiscan.xyz/${SUI_NETWORK}/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/${SUI_NETWORK}/object`;

  function displayUpload(storage_info: any, media_type: any) {
    // Extract the displayed fields from either of the two successful responses:
    // - newlyCreated for blobs that have been uploaded for the first time,
    //   or whose duration has been extended.
    // - alreadyCertified for blobs that have already been uploaded and certified.
    let info: any;
    if ("alreadyCertified" in storage_info) {
      info = {
        status: "Already certified",
        blobId: storage_info.alreadyCertified.blobId,
        endEpoch: storage_info.alreadyCertified.endEpoch,
        suiRefType: "Previous Sui Certified Event",
        suiRef: storage_info.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
      };
    } else if ("newlyCreated" in storage_info) {
      info = {
        status: "Newly created",
        blobId: storage_info.newlyCreated.blobObject.blobId,
        endEpoch: storage_info.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: "Associated Sui Object",
        suiRef: storage_info.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
      };
    } else {
      throw Error("Unhandled successful response!");
    }

    // The URL used to download and view the blob.
    const baseAggregatorUrl = "https://aggregator-devnet.walrus.space";
    const blobUrl = `${baseAggregatorUrl}/v1/${info.blobId}`;

    // The URL for viewing the event or object on chain
    const suiUrl = `${info.suiBaseUrl}/${info.suiRef}`

    const isImage = media_type.startsWith("image");
    // Create the HTML entry in the page for the uploaded blob.
    //
    // For the associated icon, we use the `<object/>` HTML element, as it allows specifying
    // the media type. The walrus aggregator returns blobs as `application/octect-stream`,
    // so it's necessary to specify the content type to the browser in the `object` element.
    const divElement = document.getElementById("uploaded-blobs") as HTMLDivElement;
    divElement.insertAdjacentHTML(
      "afterbegin",
      `<article class="row border rounded-2 shadow-sm mb-3">
            <object type="${isImage ? media_type : ''}" data="${isImage ? blobUrl : ''}"
                class="col-4 ps-0"></object>
            <dl class="blob-info col-8 my-2">
                <dt>Status</dt><dd>${info.status}</dd>

                <dt>Blob ID</dt>
                <dd class="text-truncate"><a href="${blobUrl}">${info.blobId}</a></dd>

                <dt>${info.suiRefType}</dt>
                <dd class="text-truncate">
                    <a href="${suiUrl}" target="_blank">${info.suiRef}</a>
                </dd>
                <dt>Stored until epoch</dt><dd>${info.endEpoch}</dd>
            </dl>
        </article>`
    );
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
          <Heading>Sui Write3 Demo (testnet)</Heading>
          <Box>
            {account ? (<>
              <Text>Address: <LowString text={account.address as string}></LowString></Text>
            </>) : (<div>Please connect your wallet</div>)
            }
          </Box>
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

          <Flex gap="1" direction="row">
            <Box style={{ flex: '1' }}>
              {/* 注册区域 */}
              <Box mt="4">
                <div>register author</div>
              </Box>
              <Flex mt="4">
                <input id="author" type="text" placeholder="author name" className="form-control" required
                  value={AuthorName}
                  onChange={handleInputChange}
                />
              </Flex>
              <Flex mt="4">
                <button id="register" className="btn btn-primary" onClick={handClickRegister}>
                  Regitster
                </button>
              </Flex>
              {/* 分割线 */}
              <Box mt="4">
                <hr />
              </Box>
              <Flex>
                <CompAuthorList />
              </Flex>
            </Box>
            <Box style={{ flex: '1' }}>
              {/* 中部区 */}
              <Box mt="4">
                <div>Create novel</div>
                <Box mt="4">
                  <input id="novel" type="text" placeholder="novel name" className="form-control" required />
                </Box>
                <Box mt="4">
                  <button id="create" className="btn btn-primary" onClick={handClickCreate}>
                    Create novel
                  </button>
                </Box>
              </Box>
              {/* 分割线 */}
              <Box mt="4">
                <hr />
              </Box>
              <Box mt="4">
                {/* 作者作品上传 */}
                <form id="upload-form" onSubmit={onSubmit} className="mb-3">

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
                </form>
              </Box>
              <Box mt="4">
                <div style={{ color: 'red', padding: '10px' }}>uploaded</div>
                <div id="uploaded-blobs" >

                </div>
              </Box>
            </Box>
            <Box style={{ flex: '1' }}>
              <div> novel list </div>
            </Box>
          </Flex>

          <Flex mt="200px" gap="1" direction="column">
            {/* 分割线 */}
            <Box mt="4">
              <hr />
            </Box>
            <Box>
              connect us:
            </Box>
            <Box style={{ flex: '1' }}>
              <div>
                TG :
                <a href="https://t.me/+zOCqBdkagrlmODk9" target="_blank">
                  https://t.me/+zOCqBdkagrlmODk9
                </a>
              </div>

              <div>
                X :
                <a href="https://x.com/SdSummer2" target="_blank">
                  https://x.com/SdSummer2
                </a>
              </div>
              <div>
                GitHub :
                <a href="https://github.com/etboodXJ/SuiWrite3.git" target="_blank">
                  https://github.com/etboodXJ/SuiWrite3.git
                </a>
              </div>
            </Box>
          </Flex>

        </Container>
      </Container>
    </>
  );
}

export default App;
