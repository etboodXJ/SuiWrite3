import { Flex, Box } from "@radix-ui/themes";
import "./styles.css"

interface Props {
  autholist: any; // 根据 useNetworkVariable 的类型进行定义
}

const CompAuthorList: React.FC<Props> = ({ autholist }) => {

  return (
    <Flex>
      <Flex direction="column">
        <Box mx="4" my="4">Author list : </Box>

        <Flex direction="column">
          {autholist.map((author: any) => (
            author ? (
              <Flex >
                <Box className="bold-large-text">
                  {author.fields.username.map((codePoint: number) =>
                    String.fromCodePoint(codePoint)
                  ).join('')}
                </Box>
                <Box ml="4" className="bold-large-text">
                  {author.fields.st == 0 ? "Pending" : "Approved"}
                </Box>
              </Flex>
            ) : null
          ))}
        </Flex>

      </Flex>
    </Flex>
  );
}

export default CompAuthorList;