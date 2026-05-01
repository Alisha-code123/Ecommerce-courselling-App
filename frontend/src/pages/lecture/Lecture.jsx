import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState({});
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const courseId = params.id;

  // ================= AUTH CHECK =================
  useEffect(() => {
    if (user && user.role !== "admin" && !user.subscription.includes(courseId)) {
      navigate("/");
    }
  }, [user, courseId, navigate]);

  // ================= FETCH LECTURES =================
  async function fetchLectures() {
    try {
      const { data } = await axios.get(
        `${server}/api/lectures/${courseId}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  // ================= FETCH SINGLE LECTURE =================
  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/api/lecture/${id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  // ================= VIDEO HANDLER =================
  const changeVideoHandler = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setVideo(file);
    };
  };

  // ================= ADD LECTURE (FIXED) =================
  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${courseId}/lecture`,
        formData,
        {
          headers: {
            token: localStorage.getItem("token"),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(data.message);
      setShow(false);
      setTitle("");
      setDescription("");
      setVideo("");
      setVideoPrev("");
      fetchLectures();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error");
    } finally {
      setBtnLoading(false);
    }
  };

  // ================= DELETE LECTURE =================
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      try {
        const { data } = await axios.delete(
          `${server}/api/lecture/${id}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        toast.success(data.message);
        fetchLectures();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Error");
      }
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="lecture-page">

            {/* LEFT SIDE */}
            <div className="left">
              {lecLoading ? (
                <Loading />
              ) : lecture.video ? (
                <>
                  <video
                    src={`${server}/${lecture.video}`}
                    width="100%"
                    controls
                    onEnded={() => console.log("completed")}
                  />
                  <h1>{lecture.title}</h1>
                  <h3>{lecture.description}</h3>
                </>
              ) : (
                <h1>Please Select a Lecture</h1>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="right">

              {user?.role === "admin" && (
                <button
                  className="common-btn"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Close" : "Add Lecture +"}
                </button>
              )}

              {show && (
                <form className="lecture-form" onSubmit={submitHandler}>
                  <h2>Add Lecture</h2>

                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />

                  <input
                    type="file"
                    accept="video/*"
                    onChange={changeVideoHandler}
                    required
                  />

                  {videoPrev && (
                    <video src={videoPrev} width="250" controls />
                  )}

                  <button type="submit" disabled={btnLoading}>
                    {btnLoading ? "Uploading..." : "Add Lecture"}
                  </button>
                </form>
              )}

              {/* LECTURE LIST */}
              {lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <div key={e._id}>
                    <div
                      className="lecture-number"
                      onClick={() => fetchLecture(e._id)}
                    >
                      {i + 1}. {e.title}
                    </div>

                    {user?.role === "admin" && (
                      <button
                        className="common-btn"
                        style={{ background: "red" }}
                        onClick={() => deleteHandler(e._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No Lectures Yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Lecture;