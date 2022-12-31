import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth, storage } from "../firebase-config";
import { useNavigate } from "react-router-dom";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

function CreatePost({ isAuth }) {
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [Percent, setPercent] = useState("");
  const [imgURL, setimgURL] = useState("");
  const [selectedPost, setselectedPost] = useState({});
  const [fileImgPreview, setfileImgPreview] = useState("");

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

  const handleUpload = async () => {
    if (!file) {
      toast.info("Please choose a file first!");
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
          addDoc(postsCollectionRef, {
            title,
            postText,
            author: { name: auth.currentUser?.displayName, id: auth.currentUser.uid },
            image: url,
          }).then((data) => {
            console.log(data);
            toast.success("Blog Created");
            navigate("/");
          });
        });
      }
    );
    return URL;
  };

  const postsCollectionRef = collection(db, "posts");
  let navigate = useNavigate();

  // const createPost = async () => {
  //   handleUpload().then((url) => {
  //     addDoc(postsCollectionRef, {
  //       title,
  //       postText,
  //       author: { name: auth.currentUser?.displayName, id: auth.currentUser.uid },
  //       image: imgURL,
  //     }).then((data) => {
  //       console.log(data);
  //       navigate("/");
  //     });
  //   });
  // };

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);

  return (
    <div style={{ marginTop: "30px", marginBottom: "30px" }} className="createPostPage">
      <div className="cpContainer">
        <h1>Create A Post</h1>
        {/* <div>
          <input type="file" accept="image/*" onChange={handleChange} /> */}
        {/* <button onClick={handleUpload}>Upload to Firebase</button> */}
        {/* </div> */}
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
          src={fileImgPreview}
          // src="https://images.unsplash.com/photo-1542396601-dca920ea2807?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTR8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
          alt="Select a picture"
        />
        <div className="inputGp">
          <label> Title:</label>
          <input
            placeholder="Title..."
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
        </div>
        <div className="inputGp">
          <label> Post:</label>
          <textarea
            placeholder="Post..."
            onChange={(event) => {
              setPostText(event.target.value);
            }}
          />
        </div>
        <button onClick={handleUpload}> Submit Post</button>
      </div>
    </div>
  );
}

export default CreatePost;
