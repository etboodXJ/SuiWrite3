import { useSuiClientQuery } from "@mysten/dapp-kit";
import { MoveStruct } from "@mysten/sui.js/client";

import { AuthorRoom } from "@/interface/interface";
import { useMemo } from "react";

export default function authorListHook() {

  console.log("authorListHook start");
  const authorRoomId = localStorage.getItem("authorRoomID");
  if (authorRoomId == "") return { authorRoomId, authorList: "", authorCount: 0 };

  let nowCount = 0;
  let curct: any;
  let authorList = "";
  const { data: ObjectAuthorList } = useSuiClientQuery(
    "getObject",
    {
      id: authorRoomId as string,
      options: {
        showContent: true,
        showOwner: false,
      },
    },
  );

  if (ObjectAuthorList) {
    // console.log("ObjectAuthorList", ObjectAuthorList);
    if (ObjectAuthorList?.data?.content)
      curct = ObjectAuthorList?.data?.content;

    let content = curct as {
      dataType: "moveObject";
      fields: MoveStruct;
      hasPublicTransfer: boolean;
      type: string;
    };
    if (content?.fields) {
      let authorList = content?.fields as any as AuthorRoom;
      nowCount = authorList.usrList?.length;
      let curid = authorList.authorList.fields;
      let curcontent = curid as { id: { id: string } };
      let nowid = curcontent.id.id;
      var authorData = {
        authorListId: nowid ? nowid : "",
        count: nowCount,
      }
      var jsonString = JSON.stringify(authorData);

      localStorage.setItem("authorData", jsonString);
    }
  }

  return {
    authorRoomId,
    authorList,
    authorCount: nowCount ? nowCount : 0,
  };

}