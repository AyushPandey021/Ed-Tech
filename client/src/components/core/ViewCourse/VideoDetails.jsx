import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import "video-react/dist/video-react.css"
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
} from "video-react"

import { markLectureAsComplete } from "../../../Service/Operation/courseDetailsAPI"
import { updateCompletedLectures } from "../../../Slice/viewCourseSlice"
import { BiSkipNextCircle, BiSkipPreviousCircle } from "react-icons/bi"
import { MdOutlineReplayCircleFilled } from "react-icons/md"

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState({})
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!courseSectionData?.length) return

    if (!courseId || !sectionId || !subSectionId) {
      navigate(`/dashboard/enrolled-courses`)
      return
    }

    const filteredSection = courseSectionData.find((section) => section._id === sectionId)
    const video = filteredSection?.subSection.find((sub) => sub._id === subSectionId)

    if (video) {
      setVideoData(video)
      setVideoEnded(false)
    }
  }, [courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = () => {
    const sectionIndex = courseSectionData.findIndex((data) => data._id === sectionId)
    const subIndex = courseSectionData[sectionIndex]?.subSection.findIndex((data) => data._id === subSectionId)
    return sectionIndex === 0 && subIndex === 0
  }

  const isLastVideo = () => {
    const sectionIndex = courseSectionData.findIndex((data) => data._id === sectionId)
    const subIndex = courseSectionData[sectionIndex]?.subSection.findIndex((data) => data._id === subSectionId)
    const totalSections = courseSectionData.length
    const totalSubsections = courseSectionData[sectionIndex]?.subSection.length
    return sectionIndex === totalSections - 1 && subIndex === totalSubsections - 1
  }

  const goToNextVideo = () => {
    const sectionIndex = courseSectionData.findIndex((data) => data._id === sectionId)
    const subIndex = courseSectionData[sectionIndex].subSection.findIndex((data) => data._id === subSectionId)

    if (subIndex !== courseSectionData[sectionIndex].subSection.length - 1) {
      const nextSubId = courseSectionData[sectionIndex].subSection[subIndex + 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubId}`)
    } else if (sectionIndex < courseSectionData.length - 1) {
      const nextSection = courseSectionData[sectionIndex + 1]
      navigate(`/view-course/${courseId}/section/${nextSection._id}/sub-section/${nextSection.subSection[0]._id}`)
    }
  }

  const goToPrevVideo = () => {
    const sectionIndex = courseSectionData.findIndex((data) => data._id === sectionId)
    const subIndex = courseSectionData[sectionIndex].subSection.findIndex((data) => data._id === subSectionId)

    if (subIndex > 0) {
      const prevSubId = courseSectionData[sectionIndex].subSection[subIndex - 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubId}`)
    } else if (sectionIndex > 0) {
      const prevSection = courseSectionData[sectionIndex - 1]
      const lastSub = prevSection.subSection[prevSection.subSection.length - 1]
      navigate(`/view-course/${courseId}/section/${prevSection._id}/sub-section/${lastSub._id}`)
    }
  }

  const handleLectureCompletion = async () => {
    try {
      setLoading(true)
      const res = await markLectureAsComplete(
        { courseId: courseId, subsectionId: subSectionId },
        token
      )
      if (res?.success) {
        dispatch(updateCompletedLectures(subSectionId))
      }
    } catch (err) {
      console.error("Error marking lecture as complete", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='md:w-[calc(100vw-320px)] w-screen p-3'>
      {!videoData || !videoData.videoUrl ? (
        <h1>Loading...</h1>
      ) : (
        <>
          <div>
            <Player
              className="w-full relative"
              ref={playerRef}
              src={videoData.videoUrl}
              aspectRatio="16:9"
              fluid={true}
              autoPlay={false}
              onEnded={() => setVideoEnded(true)}
            >
              <BigPlayButton position="center" />
              <LoadingSpinner />
              <ControlBar>
                <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
                <ReplayControl seconds={5} order={7.1} />
                <ForwardControl seconds={5} order={7.2} />
                <TimeDivider order={4.2} />
                <CurrentTimeDisplay order={4.1} />
              </ControlBar>
              {videoEnded && (
                <div className='flex justify-center items-center z-20 absolute inset-0'>
                  {!completedLectures.includes(videoData._id) && (
                    <button
                      onClick={handleLectureCompletion}
                      className='bg-yellow-100 text-richblack-900 font-medium md:text-sm px-4 py-2 rounded-md hover:scale-90'
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Mark as Completed"}
                    </button>
                  )}
                  {!isFirstVideo() && (
                    <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                      <BiSkipPreviousCircle
                        onClick={goToPrevVideo}
                        className="text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90"
                      />
                    </div>
                  )}
                  {!isLastVideo() && (
                    <div className='absolute right-4 top-1/2 transform -translate-y-1/2'>
                      <BiSkipNextCircle
                        onClick={goToNextVideo}
                        className="text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90"
                      />
                    </div>
                  )}
                  <MdOutlineReplayCircleFilled
                    onClick={() => {
                      playerRef.current.seek(0)
                      playerRef.current.play()
                      setVideoEnded(false)
                    }}
                    className="text-5xl bg-richblack-600 rounded-full cursor-pointer hover:scale-90 absolute"
                  />
                </div>
              )}
            </Player>
          </div>
          <div className='mt-5'>
            <h1 className='text-2xl font-bold text-richblack-25'>{videoData?.title}</h1>
            <p className='text-richblack-100'>{videoData?.description}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default VideoDetails
