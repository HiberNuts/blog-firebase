import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase-config";
import { getDocs, collection, deleteDoc, doc, updateDoc, addDoc } from "firebase/firestore";
import "../App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";
import edit from "./pencil.png";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import Modal from "react-modal";
import Comments from "./Comments";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement(document.getElementById("root"));

const Profile = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [postLists, setPostList] = useState([]);
  const [post, setpost] = useState([]);
  const postsCollectionRef = collection(db, "posts");
  const [dummy, setdummy] = useState("");
  const [editPostId, seteditPostId] = useState("");
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [Percent, setPercent] = useState("");
  const [imgURL, setimgURL] = useState("");
  const [selectedPost, setselectedPost] = useState({});
  const [fileImgPreview, setfileImgPreview] = useState("");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState("");
  function handleChange(event) {
    console.log(event);
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
    console.log(file);
    if (event.target.files.length > 0) {
      setfileImgPreview(URL?.createObjectURL(event.target.files[0]));
      console.log(fileImgPreview);
    }
  }

  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please choose a file first!");
      return;
    }
    let URL = "";
    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100); // update progress
        setPercent(percent);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log(url);
          URL = url;
          setimgURL(url);
          const editDoc = doc(db, "posts", editPostId);
          console.log(editDoc);
          updateDoc(editDoc, {
            title: title,
            postText: postText,
            author: { name: auth.currentUser?.displayName, id: auth.currentUser.uid },
            image: url,
          }).then((data) => {
            console.log(data);
            toast.success("Blog updated");
            navigate("/");
          });
        });
      }
    );
    return URL;
  };

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
  };

  const editPost = async (post) => {
    console.log(post);
    setselectedPost(post);
    const postDoc = doc(db, "posts", post?.id);
    seteditPostId(post?.id);
    openModal();
    // await deleteDoc(postDoc);
  };
  useEffect(() => {
    const getPosts = async () => {
      const data = await getDocs(postsCollectionRef);
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      console.log(postLists);
    };
    getPosts();
  }, []);

  return (
    <div className="profile">
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel="Example Modal">
        <div className="cpContainer">
          <h1>Create A Post</h1>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <input type="file" accept="image/*" onChange={handleChange} />
          </div>
          <img
            style={{ width: "100%", height: "300px" }}
            src={file ? fileImgPreview : selectedPost.image}
            // src="https://images.unsplash.com/photo-1542396601-dca920ea2807?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTR8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
            alt=""
          />
          <div className="inputGp">
            <label> Title:</label>
            <input
              value={selectedPost.title}
              placeholder="Title..."
              onChange={(event) => {
                setselectedPost({ ...selectedPost, title: event.target.value });
                setTitle(event.target.value);
              }}
            />
          </div>
          <div className="inputGp">
            <label> Post:</label>
            <textarea
              value={selectedPost.postText}
              placeholder="Post..."
              onChange={(event) => {
                setselectedPost({ ...selectedPost, postText: event.target.value });
                setPostText(event.target.value);
              }}
            />
          </div>
          <button onClick={() => handleUpload(editPostId)}>Update post</button>
        </div>
      </Modal>
      <div className="pro1">
        <img
          style={{ borderRadius: "50%", width: "150px", height: "150px", objectFit: "fill", objectPosition: "center" }}
          src={auth.currentUser?.photoURL}
        />
        <h3>{auth?.currentUser?.displayName}</h3>
        <h3>{auth?.currentUser?.email}</h3>
      </div>
      <div className="homePage">
        <h3 style={{ marginTop: "-10px" }} className="pro1">
          Your Blogs 👇👇
        </h3>
        {postLists.filter((post) => {
          return post.author?.id == auth.currentUser?.uid;
        }).length <= 0 && <h1 style={{ fontFamily: "revert" }}>Your have not published any blogs yet!!!!</h1>}
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
        {postLists
          .filter((post) => {
            if (query === "") {
              return post;
            } else if (post?.title?.toLowerCase().includes(query.toLowerCase())) {
              return post;
            }
          })
          .filter((post) => {
            return post.author?.id == auth.currentUser?.uid;
          })
          .map((post) => {
            return (
              <div className="post">
                <img
                  style={{ width: "100%", height: "300px" }}
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
                  <div className="editPost deletePost">
                    {isAuth && post.author?.id === auth.currentUser?.uid && (
                      <img
                        style={{ marginTop: "10px", cursor: "pointer" }}
                        src={edit}
                        onClick={() => {
                          editPost(post);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="postTextContainer"> {post.postText} </div>
                <h3>@{post.author?.name}</h3>
                <div className="comments">
                  <Comments post={post} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Profile;
