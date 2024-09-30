
import { AuthorRoom } from "@/interface/interface";
import { useSuiClientQuery } from "@mysten/dapp-kit";

export default function authorListInitHook() {

  const authorTablelistTypeArray: [] = [];

  const storedJsonString: string = localStorage.getItem("authorData") as string;
  var storedData = JSON.parse(storedJsonString);
  let authorTableId = storedData?.authorListId as string;

  if (authorTableId == "") {
    console.log("authorTableId no id");
    return {
      authorTablelistType: authorTablelistTypeArray
    };
  }

  const { data: authorTablelistType, refetch: refetchEvents } = useSuiClientQuery(
    "getDynamicFields",
    {
      parentId: authorTableId as string,
    },
  );
  if (authorTablelistType) {
    console.log("authorTablelistType", authorTablelistType);
    localStorage.setItem("authorTablelistType", JSON.stringify(authorTablelistType.data));
  }

  return {
    authorTablelistType,
    refetchEvents
  }
}
