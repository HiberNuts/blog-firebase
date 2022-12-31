import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import clap from "./clap.png";
import Comments from "./Comments";

function Home({ isAuth }) {
  const [postLists, setPostList] = useState([]);
  const [query, setQuery] = useState("");
  const postsCollectionRef = collection(db, "posts");
  const [commentValue, setcommentValue] = useState("");

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
  };

  const likePost = async (id, value, users) => {
    let likes = 0;
    console.log(users);
    let usersArray = [];

    if (value) {
      likes = value;
    }
    if (users == undefined) {
      usersArray.push(auth.currentUser?.uid);
    } else {
      if (users.includes(auth.currentUser?.uid)) {
        var filteredArray = users.filter((e) => e !== auth.currentUser?.uid);
        usersArray = [...filteredArray];
      } else {
        usersArray = [...users];
        usersArray.push(auth.currentUser?.uid);
      }
    }

    const likeDoc = doc(db, "posts", id);
    await updateDoc(likeDoc, {
      likes: {
        value: likes + 1,
        users: usersArray,
      },
    });
  };

  // const handleComment = (id, comment) => {
  //   console.log("working");
  //   const likeDoc = doc(db, "posts", id);
  //   console.log(commentValue);
  //   // await updateDoc(likeDoc, {
  //   //   likes: {
  //   //     value: likes + 1,
  //   //     users: usersArray,
  //   //   },
  //   // });
  // };

  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(postsCollectionRef);
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    // console.log(postLists)
    getPosts();
  }, [deletePost]);

  // console.log(auth.currentUser);

  return (
    <div className="homePage">
      <input
        style={{
          width: "350px",
          height: "40px",
          border: "2px solid black",
          borderRadius: "20px",
          fontSize: "20px",
          fontFamily: "monospace",
        }}
        placeholder=" &#128270; Search blog by title"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {postLists
          .filter((post) => {
            if (query === "") {
              return post;
            } else if (post?.title?.toLowerCase().includes(query.toLowerCase())) {
              return post;
            }
          })
          .map((post) => {
            return (
              <div className="post">
                <img
                  style={{ width: "100%", height: "400px" }}
                  src={post.image}
                  // src="https://images.unsplash.com/photo-1542396601-dca920ea2807?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTR8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
                  alt=""
                />
                <div className="postHeader">
                  <div className="title">
                    <h1> {post.title}</h1>
                  </div>
                  <div className="deletePost">
                    {isAuth && post.author?.id === auth.currentUser?.uid && (
                      <button
                        onClick={() => {
                          deletePost(post.id);
                        }}
                      >
                        {" "}
                        &#128465;
                      </button>
                    )}
                  </div>
                </div>
                <div className="postTextContainer"> {post.postText} </div>
                <h3>@{post.author?.name}</h3>
                {auth.currentUser?.uid && (
                  <div style={{ display: "flex" }}>
                    <button
                      onClick={() => {
                        likePost(post.id, post?.likes?.value, post?.likes?.users);
                      }}
                      style={{ backgroundColor: "transparent", border: "none" }}
                    >
                      <img style={{ cursor: "pointer" }} src={clap} />
                    </button>
                    <h2>{post?.likes?.users?.length || 0}</h2>
                  </div>
                )}
                <div className="comments">
                  <Comments post={post} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Home;
