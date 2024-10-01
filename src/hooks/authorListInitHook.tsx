
import { AuthorRoom } from "@/interface/interface";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useMemo } from "react";

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
    // localStorage.setItem("authorTablelistType", JSON.stringify(authorTablelistType.data));

    // let tbTasktypelist = useMemo(() => {
    //   const calTasklist = authorTablelistType?.data.map((obj: any) => {
    //     let nowfields = [obj.name.type, obj.name.value] as any;
    //     return nowfields;
    //   });
    //   return calTasklist;

    // }, [authorTablelistType.data]);

    const tbTasktypelist = authorTablelistType?.data.map((obj: any) => {
      let nowfields = [obj.name.type, obj.name.value] as any;
      return nowfields;
    });

    let nowauthorlisttype = [] as any;
    tbTasktypelist.forEach((item) => {
      // console.log("item####", item);
      const obj = {
        method: "getDynamicFieldObject",
        params: {
          parentId: authorTableId as string,
          name: {
            type: item[0],
            value: item[1],
          }
        }
      };
      nowauthorlisttype.push(obj);
    });
    // console.log("nowauthorlisttype", nowauthorlisttype);
    localStorage.setItem("authorTablelistType", JSON.stringify(nowauthorlisttype));
  }


  return {
    authorTablelistType,
    refetchEvents
  }
}
