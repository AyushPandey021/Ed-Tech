import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "video-react/dist/video-react.css";
import {
  BigPlayButton,
  ControlBar,
  CurrentTimeDisplay,
  ForwardControl,
  LoadingSpinner,
  PlaybackRateMenuButton,
  Player,
  ReplayControl,
  TimeDivider,
} from "video-react";

import { markLectureAsComplete } from "../../../Service/Operation/courseDetailsAPI";
import { updateCompletedLectures } from "../../../Slice/viewCourseSlice";

import { BiSkipNextCircle, BiSkipPreviousCircle } from "react-icons/bi";
import { MdOutlineReplayCircleFilled } from "react-icons/md";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, completedLectures } = useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [, setLoading] = useState(false);

  // Fetch current video data
  useEffect(() => {
    if (!courseSectionData.length || !courseId || !sectionId || !subSectionId) {
      navigate(`/dashboard/enrolled-courses`);
      return;
    }

    const currentSection = courseSectionData.find((section) => section._id === sectionId);
    const currentVideo = currentSection?.subSection.find((sub) => sub._id === subSectionId);

    setVideoData(currentVideo || null);
    setVideoEnded(false);
  }, [courseSectionData, sectionId, subSectionId, courseId, location.pathname, navigate]);

  const isFirstVideo = () => {
    const secIndex = courseSectionData.findIndex((sec) => sec._id === sectionId);
    const subIndex = courseSectionData[secIndex]?.subSection.findIndex((sub) => sub._id === subSectionId);
    return secIndex === 0 && subIndex === 0;
  };

  const isLastVideo = () => {
    const secIndex = courseSectionData.findIndex((sec) => sec._id === sectionId);
    const subIndex = courseSectionData[secIndex]?.subSection.findIndex((sub) => sub._id === subSectionId);
    return (
      secIndex === courseSectionData.length - 1 &&
      subIndex === courseSectionData[secIndex].subSection.length - 1
    );
  };

  const goToNextVideo = () => {
    const secIndex = courseSectionData.findIndex((sec) => sec._id === sectionId);
    const subIndex = courseSectionData[secIndex]?.subSection.findIndex((sub) => sub._id === subSectionId);

    if (subIndex < courseSectionData[secIndex].subSection.length - 1) {
      const nextSub = courseSectionData[secIndex].subSection[subIndex + 1];
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSub._id}`);
    } else if (secIndex < courseSectionData.length - 1) {
      const nextSection = courseSectionData[secIndex + 1];
      const nextSub = nextSection.subSection[0];
      navigate(`/view-course/${courseId}/section/${nextSection._id}/sub-section/${nextSub._id}`);
    }
  };

  const goToPrevVideo = () => {
    const secIndex = courseSectionData.findIndex((sec) => sec._id === sectionId);
    const subIndex = courseSectionData[secIndex]?.subSection.findIndex((sub) => sub._id === subSectionId);

    if (subIndex > 0) {
      const prevSub = courseSectionData[secIndex].subSection[subIndex - 1];
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSub._id}`);
    } else if (secIndex > 0) {
      const prevSection = courseSectionData[secIndex - 1];
      const lastSub = prevSection.subSection[prevSection.subSection.length - 1];
      navigate(`/view-course/${courseId}/section/${prevSection._id}/sub-section/${lastSub._id}`);
    }
  };

  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete({ courseId, subsectionId: subSectionId }, token);
    if (res) dispatch(updateCompletedLectures(subSectionId));
    setLoading(false);
  };

  if (!videoData) return <h1 className="text-white text-center mt-10">Loading...</h1>;

  return (
    <div className="md:w-[calc(100vw-320px)] w-screen p-3 text-white">
      <div>
        <Player
          className="w-full relative"
          ref={playerRef}
          src={videoData.videoUrl}
          aspectRatio="16:9"
          fluid
          autoPlay={false}
          onEnded={() => setVideoEnded(true)}
        >
          <BigPlayButton position="center" />
          <LoadingSpinner />
          <ControlBar>
            <PlaybackRateMenuButton rates={[2, 1.5, 1, 0.75, 0.5]} order={7.1} />
            <ReplayControl seconds={5} order={7.2} />
            <ForwardControl seconds={5} order={7.3} />
            <CurrentTimeDisplay order={4.1} />
            <TimeDivider order={4.2} />
          </ControlBar>
        </Player>

        {videoEnded && (
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-5 z-10 bg-black/40">
            {!completedLectures.includes(videoData._id) && (
              <button
                onClick={handleLectureCompletion}
                className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-lg hover:scale-95 transition-all"
              >
                Mark as Completed
              </button>
            )}

            <div className="flex justify-between w-full px-10">
              {!isFirstVideo() && (
                <BiSkipPreviousCircle
                  onClick={goToPrevVideo}
                  className="text-5xl cursor-pointer hover:scale-95"
                />
              )}
              <MdOutlineReplayCircleFilled
                onClick={() => {
                  playerRef.current.seek(0);
                  playerRef.current.play();
                  setVideoEnded(false);
                }}
                className="text-5xl cursor-pointer hover:scale-95"
              />
              {!isLastVideo() && (
                <BiSkipNextCircle
                  onClick={goToNextVideo}
                  className="text-5xl cursor-pointer hover:scale-95"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-bold">{videoData.title}</h2>
        <p className="text-richblack-100">{videoData.description}</p>
      </div>
    </div>
  );
};

export default VideoDetails;
