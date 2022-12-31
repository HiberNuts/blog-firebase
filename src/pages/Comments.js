import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import { toast } from "react-toastify";

const Comments = ({ post }) => {
  const [commentValue, setcommentValue] = useState("");
  const [showComment, setshowComment] = useState(false);

  const handleComment = async (id, comment) => {
    if (commentValue.length <= 0) {
      toast.warning("Please add a comment");
      return;
    }
    console.log(post);
    const commentDoc = doc(db, "posts", post?.id);
    let usersArray = [];
    console.log(commentDoc);
    if (comment == undefined) {
      console.log("as");
      usersArray.push({
        author: auth?.currentUser?.displayName,
        comment: commentValue,
        created: Date.now(),
      });
    } else {
      usersArray = [...comment];
      usersArray.push({
        author: auth?.currentUser?.displayName,
        comment: commentValue,
        created: Date.now(),
      });
    }
    console.log(usersArray);
    await updateDoc(commentDoc, {
      comments: usersArray,
    });
    setcommentValue("");
  };
  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date) {
    return [padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate()), date.getFullYear()].join("/");
  }

  return (
    <div>
      <input
        style={{
          width: "350px",
          height: "40px",
          border: "2px solid black",
          borderRadius: "20px",
          fontSize: "20px",
          fontFamily: "monospace",
        }}
        type="text"
        value={commentValue}
        onChange={(e) => setcommentValue(e.target.value)}
        placeholder="Add a comment"
      />
      <button onClick={() => handleComment(post?.id, post?.comments)} className="btn">
        ✅
      </button>
      <button
        onClick={() => setshowComment(!showComment)}
        style={{ fontWeight: "bold", fontFamily: "monospace", fontSize: "18px" }}
        className="btn"
      >
        View comments
      </button>
      {showComment && (
        <div className="showComm">
          <hr />
          {!post?.comments && (
            <div style={{ fontWeight: "bold", fontFamily: "monospace", marginTop: "20px", fontSize: "18px" }}>
              No Comments yet
            </div>
          )}
          {post?.comments?.map((com) => {
            return (
              <div>
                <p style={{ fontWeight: "bold", fontFamily: "monospace", fontSize: "18px" }} className="comName">
                  {com?.author} Wrote - {formatDate(new Date(com?.created)).toString()}
                </p>
                <p style={{ fontFamily: "cursive", fontSize: "18px" }} className="comDesc">
                  {com?.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comments;
