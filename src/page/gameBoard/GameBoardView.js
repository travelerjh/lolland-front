import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Divider,
  HStack,
  Spinner,
  Image,
  Td,
  useToast,
  VStack,
  Tooltip,
  Heading,
  Flex,
} from "@chakra-ui/react";
import GameBoardCommentContainer from "./GameBoardCommentContainer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as emptyHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fullHeart } from "@fortawesome/free-solid-svg-icons";
import { LoginContext } from "../../component/LoginProvider";

function LikeContainer({ like, onClick }) {
  const { isAuthenticated } = useContext(LoginContext);

  if (like === null) {
    return <Spinner />;
  }

  return (
    <Flex gap={2} position={"relative"}>
      <Tooltip isDisabled={isAuthenticated()} hasArrow label={"로그인 하세요"}>
        <Button variant="ghost" size="xl" onClick={onClick}>
          {like.like && <FontAwesomeIcon icon={fullHeart} size={"xl"} />}
          {/*<FontAwesomeIcon icon={faHeart} size={"xl"} />*/}
          {like.like || <FontAwesomeIcon icon={emptyHeart} size={"xl"} />}
        </Button>
      </Tooltip>
      <Heading size={"lg"}>{like.countLike}</Heading>
    </Flex>
  );
}
export function GameBoardView(props) {
  const [board, setBoard] = useState(null);
  const [like, setLike] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, hasAccess } = useContext(LoginContext);

  useEffect(() => {
    axios.get("/api/gameboard/id/" + id).then((response) => {
      setBoard(response.data);
    });
  }, [id]);

  useEffect(() => {
    axios
      .get("/api/like/gameboard/" + id)
      .then((response) => setLike(response.data));
  }, []);

  function handleDelete() {
    axios
      .delete("/api/gameboard/remove/" + id)
      .then((response) => {
        toast({
          description: id + "번 게시물 삭제 완료",
          status: "success",
        });
        navigate(-1);
      })
      .catch((error) => {
        toast({
          description: "실패",
          status: "error",
        });
      });
  }

  function handleLike() {
    axios
      .post("/api/like", { game_board_id: board.id })
      .then((response) => setLike(response.data))
      .catch(() =>
        toast({
          description: "로그인 후 이용 해주세요.",
          status: "error",
        }),
      )
      .finally(() => console.log("done"));

    // {
    //   setLike((prevLike) => ({
    //     like: !prevLike.like, // 현재 상태의 반대로 like 상태를 토글합니다.
    //     countLike: response.data.countLike, // 필요한 경우 카운트 업데이트
    //   }));
    //   const successMessage = !like.like
    //     ? "좋아요를 눌렀습니다."
    //     : "좋아요를 취소했습니다.";
    //   const statusChange = !like.like ? "success" : "error";
    //   toast({ description: successMessage, status: statusChange });
    // })
    // .catch(() => {
    //   toast({
    //     description: "좋아요 처리 중 오류가 발생했습니다.",
    //     status: "error",
    //   });
    // });
  }

  if (board === null) {
    return <Spinner />;
  }

  return (
    <Box>
      <Center>
        <VStack py={"100px"}>
          <HStack>
            <Button onClick={() => navigate(-1)}> 이전 </Button>
            {hasAccess(board.member_id) && (
              <Button
                colorScheme={"purple"}
                onClick={() => navigate("/gameboard/edit/" + id)}
              >
                수정
              </Button>
            )}

            {hasAccess(board.member_id) && (
              <Button onClick={handleDelete} colorScheme={"red"}>
                삭제
              </Button>
            )}
            <LikeContainer onClick={handleLike} like={like} />
          </HStack>
          <Box
            border={"1px solid grey"}
            borderRadius={"10px"}
            textAlign={"center"}
            py={"10px"}
          >
            <h1> 글 보기 </h1>
            <Divider />
            <p> id :{board.id}</p>
            <Divider />
            <p> title :{board.title}</p>
            <Divider />
            <p> count: {board.board_count}</p>
            <Divider />
            <p> content :{board.board_content}</p>
            <Divider />
            {/*<p> reg_ time: {board.reg_time}</p>*/}
            <p>{new Date(board.reg_time).toLocaleString()}</p>
            <Divider />
          </Box>
          {board.files.map((file) => (
            <Box key={file.id}>
              <Image
                width={"100%"}
                src={file.file_url}
                alt={file.file_name}
                borderRadius={"full"}
                boxSize={"150px"}
              />
            </Box>
          ))}
          <HStack px={"10px"}>
            <GameBoardCommentContainer />
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
}

export default GameBoardView;
