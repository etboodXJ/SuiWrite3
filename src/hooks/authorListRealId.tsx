import { useSuiClientQueries } from "@mysten/dapp-kit";

export default function authorListRealId() {

  const storedJsonString: string = localStorage.getItem("authorTablelistType") as string;
  var storedData = JSON.parse(storedJsonString);

  const { data: tbAuthorlistDetails } = useSuiClientQueries({
    queries: storedData,
    combine: (result) => {
      return {
        data: result.map((res) => res.data),
      }
    }
  });

  // if (tbAuthorlistDetails) {
  //   console.log("tbAuthorlistDetails", tbAuthorlistDetails);
  // }

  return {
    tbAuthorlistDetails: tbAuthorlistDetails?.map((obj: any) => {
      let nowfields = obj?.data?.content.fields.value;
      return nowfields;
    })
  }

}
