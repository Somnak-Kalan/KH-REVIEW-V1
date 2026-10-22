import { FolderOutlined, TagsOutlined } from '@ant-design/icons'
import CountUp from 'react-countup'
import { useNavigate } from 'react-router-dom'

const CardDashboard = () => {
  const navigate = useNavigate()
  const TotalService = 100
  const totalMoments = 120
  const totalLocation = 100
  const TotalPromotion = 100

  return (
    <>
      <div className='flex items-center justify-center  my-5'>
        <div className='grid lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-4  gap-6 w-full '>
          <div className='flex items-center p-4 bg-white rounded shadow-md transition-transform transform hover:scale-105 hover:shadow-lg'>
            <div className='flex flex-shrink-0 items-center justify-center bg-green-500 h-16 w-16 rounded transition-colors hover:bg-green-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='60'
                height='80'
                viewBox='0 0 24 24'
                className='text-white'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z' />
                <circle cx='12' cy='11' r='2' />
              </svg>
            </div>
            <div className='flex-grow flex flex-col ml-4'>
              <span className='text-xl font-bold'>
                {' '}
                <CountUp
                  start={0}
                  end={totalLocation}
                  duration={20}
                  delay={0}
                />
              </span>
              <div className='flex items-center justify-between'>
                <span className='text-gray-500'>Business Place</span>
              </div>
            </div>
          </div>

          <div className='flex items-center p-4 bg-white rounded shadow-md transition-transform transform hover:scale-105 hover:shadow-lg'>
            <div className='flex flex-shrink-0 items-center justify-center bg-red-500 h-16 w-16 rounded transition-colors hover:bg-red-600'>
              <svg
                className='h-8 w-8 text-white'
                viewBox='0 0 28 28'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4.19999 1.4C3.4268 1.4 2.79999 2.02681 2.79999 2.8C2.79999 3.57319 3.4268 4.2 4.19999 4.2H5.9069L6.33468 5.91114C6.33917 5.93092 6.34409 5.95055 6.34941 5.97001L8.24953 13.5705L6.99992 14.8201C5.23602 16.584 6.48528 19.6 8.97981 19.6H21C21.7731 19.6 22.4 18.9732 22.4 18.2C22.4 17.4268 21.7731 16.8 21 16.8H8.97983L10.3798 15.4H19.6C20.1303 15.4 20.615 15.1004 20.8521 14.6261L25.0521 6.22609C25.2691 5.79212 25.246 5.27673 24.991 4.86398C24.7357 4.45123 24.2852 4.2 23.8 4.2H8.79308L8.35818 2.46044C8.20238 1.83722 7.64241 1.4 6.99999 1.4H4.19999Z'
                  fill='currentColor'
                ></path>
                <path
                  d='M22.4 23.1C22.4 24.2598 21.4598 25.2 20.3 25.2C19.1403 25.2 18.2 24.2598 18.2 23.1C18.2 21.9402 19.1403 21 20.3 21C21.4598 21 22.4 21.9402 22.4 23.1Z'
                  fill='currentColor'
                ></path>
                <path
                  d='M9.1 25.2C10.2598 25.2 11.2 24.2598 11.2 23.1C11.2 21.9402 10.2598 21 9.1 21C7.9402 21 7 21.9402 7 23.1C7 24.2598 7.9402 25.2 9.1 25.2Z'
                  fill='currentColor'
                ></path>
              </svg>
            </div>
            <div className='flex-grow flex flex-col ml-4'>
              <span className='text-xl font-bold'>
                {' '}
                <CountUp start={0} end={TotalService} duration={20} delay={0} />
              </span>
              <div className='flex items-center justify-between'>
                <span className='text-gray-500'> Banner </span>
              </div>
            </div>
          </div>

          {/* <div className='flex items-center p-4 bg-white rounded shadow-md transition-transform transform hover:scale-105 hover:shadow-lg'>
            <div className='flex flex-shrink-0 items-center justify-center bg-blue-500 h-16 w-16 rounded transition-colors hover:bg-blue-600'>
              <FolderOutlined style={{ fontSize: '30px', color: 'white' }} />
            </div>
            <div className='flex-grow flex flex-col ml-4'>
              <span className='text-xl font-bold'>
                {' '}
                <CountUp start={0} end={totalMoments} duration={20} delay={0} />
              </span>
              <div className='flex items-center justify-between'>
                <span className='text-gray-500'>Tour</span>
              </div>
            </div>
          </div> */}

          <div className='flex items-center  p-4 bg-white rounded shadow-md transition-transform transform hover:scale-105 hover:shadow-lg'>
            <div className='flex flex-shrink-0 items-center justify-center bg-yellow-500 h-16 w-16 rounded transition-colors hover:bg-yellow-600'>
              <TagsOutlined style={{ fontSize: '30px', color: 'white' }} />
            </div>
            <div className='flex-grow flex flex-col ml-4'>
              <span className='text-xl font-bold'>
                {' '}
                <CountUp
                  start={0}
                  end={TotalPromotion}
                  duration={20}
                  delay={0}
                />
              </span>
              <div className='flex items-center justify-between'>
                <span className='text-gray-500'>Moments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CardDashboard
