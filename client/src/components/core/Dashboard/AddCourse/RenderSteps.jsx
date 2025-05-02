import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { FaCheck } from 'react-icons/fa';
import CourseBuilderForm from './CourseBuilder/CourseBuilderForm';
import CourseInformationForm from './CourseInformation/CourseInformationForm';
import PublishCourse from './PublishCourse';

const RenderSteps = () => {
  const { step } = useSelector((state) => state.course);

  // Define step information
  const steps = [
    { id: 1, title: 'Course Information' },
    { id: 2, title: 'Course Builder' },
    { id: 3, title: 'Publish' },
  ];

  return (
    <div>
      {/* Progress Steps Indicator (Circles + Dashed Line) */}
      <div className="flex w-full justify-center mb-2">
        {steps.map((item, index) => (
          <Fragment key={item.id}>
            {/* Step Circle */}
            <div
              className={`grid place-items-center aspect-square rounded-full w-[34px] border select-none
                ${item.id < step && 'bg-yellow-50 text-yellow-50'} 
                ${item.id === step && 'border-yellow-50 bg-yellow-900 text-yellow-50'} 
                ${item.id > step && 'border-richblack-700 bg-richblack-800 text-richblack-300'}
              `}
            >
              {item.id < step ? (
                <FaCheck className="font-bold text-richblack-900" />
              ) : (
                item.id
              )}
            </div>

            {/* Dashed Line Between Steps */}
            {index !== steps.length - 1 && (
              <div
                className={`h-[17px] w-[33%] border-b-2 border-dashed
                  ${item.id < step ? 'border-yellow-50' : 'border-richblack-500'}
                `}
              />
            )}
          </Fragment>
        ))}
      </div>

      {/* Step Titles for Desktop */}
      <div className="mb-10 md:mb-16">
        <div className="hidden md:flex justify-between select-none">
          {steps.map((item) => (
            <div
              key={item.id}
              className={`min-w-[130px] text-center text-sm uppercase tracking-wider
                ${item.id <= step ? 'text-richblack-5' : 'text-richblack-500'}
              `}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>

      {/* Step Name for Mobile View */}
      <div className="md:hidden font-semibold mb-5 text-xl">
        {step === 1 && 'Course Information'}
        {step === 2 && 'Course Builder'}
        {step === 3 && 'Publish Course'}
      </div>

      {/* Render Corresponding Form Component */}
      {step === 1 && <CourseInformationForm />}
      {step === 2 && <CourseBuilderForm />}
      {step === 3 && <PublishCourse />}
    </div>
  );
};

export default RenderSteps;
