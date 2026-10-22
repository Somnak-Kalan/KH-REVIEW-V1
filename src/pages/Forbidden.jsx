import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'
// icons

//
//
// change the component name here and export default at the below too
const Forbidden = () => {
  const navigate = useNavigate()
  return (
    <div>
      <div className=''></div>
      {/* card */}
      <div style={{ marginTop: '100px' }}>
        <Result
          status='403'
          title='403'
          subTitle='Sorry, the page you visited does not exist.'
          extra={
            <Button type='primary' onClick={() => navigate('/')}>
              Back Home
            </Button>
          }
        />
        {/* code here */}
      </div>
    </div>
  )
}
// change the component name here too
export default Forbidden
