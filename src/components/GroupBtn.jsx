// components
import {
  SaveOutlined,
  CloseOutlined,
  LeftOutlined,
  EditOutlined,
  PrinterOutlined,
  UploadOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  KeyOutlined,
  SyncOutlined,
  LockOutlined,
} from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'
import { Button, Space, Tooltip } from 'antd'
//
// const GroupButton = Button.Group
//
const GroupBtn = (props) => {
  const {
    collapsed,
    loadingBtnState,
    // back btn
    backBtn,
    showBackBtn,
    onBackBtnClick,
    // save btn
    saveBtn,
    showSaveBtn,
    onSaveBtnClick,
    // edit btn
    editBtn,
    showEditBtn,
    onEditBtnClick,
    //view btn
    viewBtn,
    showViewBtn,
    onViewBtnClick,
    // print btn
    printBtn,
    showPrintBtn,
    onPrintBtnClick,
    // export btn
    exportBtn,
    showExportBtn,
    onExportBtnClick,
    // unlock btn
    unlockBtn,
    showUnlockBtn,
    onUnlockBtnClick,
    // update btn
    // unlock btn
    qrCodeBtn,
    showQRCode,
    onQRCodeBtnClick,
    // update btn
    updateBtn,
    showUpdateBtn,
    onUpdateBtnClick,
    // delete btn
    deleteBtn,
    showDeleteBtn,
    onDeleteBtnClick,
    // reset btn
    resetBtn,
    showResetBtn,
    onResetBtnClick,
    //
    disabledBtn,
    showDisableBtn,
    onDisableBtn,
    //
    //
    enableBtn,
    showEnableBtn,
    onEnableBtn,
    //
    changePasswordBtn,
    showChangePasswordBtn,
    onChangePasswordBtn,
    //
    resetDeviceId,
    showResetDeviceId,
    onResetDeviceId,
    //
    approveBtn,
    showApproveBtn,
    onApproveBtn,
    //
    rejectBtn,
    showRejectBtn,
    onRejectBtn,
  } = props

  return (
    <div
      style={{
        // position: 'fixed',
        // left: collapsed ? '95px' : '246px',
        // top: '68px',

        zIndex: '999',
      }}
    >
      <Space>
        {showBackBtn ? (
          <Button
            loading={loadingBtnState}
            style={{
              backgroundColor: !backBtn ? 'gray' : '#0a4199',
              color: 'white',
            }}
            className=''
            icon={<LeftOutlined />}
            disabled={!backBtn}
            onClick={onBackBtnClick}
          />
        ) : null}
        {showSaveBtn ||
        showEditBtn ||
        showViewBtn ||
        showPrintBtn ||
        showExportBtn ||
        showUnlockBtn ||
        showUpdateBtn ||
        showDisableBtn ||
        showEnableBtn ||
        showResetDeviceId ||
        showChangePasswordBtn ||
        onQRCodeBtnClick ||
        showApproveBtn ||
        showRejectBtn ||
        showDeleteBtn ? (
          <Space>
            {showSaveBtn ? (
              <Button
                loading={loadingBtnState}
                type='primary'
                icon={<SaveOutlined />}
                disabled={!saveBtn}
                onClick={onSaveBtnClick}
              >
                Save
              </Button>
            ) : null}
            {showEditBtn ? (
              <Button
                loading={loadingBtnState}
                style={{
                  color: '#0a4199',
                  // height: '29px', // Custom height in pixels

                  // border: printBtn ? '1px solid #0a4199' : '',
                }}
                icon={<EditOutlined />}
                disabled={!editBtn}
                onClick={onEditBtnClick}
              >
                Edit
              </Button>
            ) : null}
            {/* view */}
            {showViewBtn ? (
              <Button
                loading={loadingBtnState}
                style={{
                  color: '#0a4199',
                  // height: '29px', // Custom height in pixels

                  // border: printBtn ? '1px solid #0a4199' : '',
                }}
                icon={<EditOutlined />}
                disabled={!viewBtn}
                onClick={onViewBtnClick}
              >
                View
              </Button>
            ) : null}
            {/* end view */}
            {showPrintBtn ? (
              <Button
                loading={loadingBtnState}
                style={{
                  color: '#0a4199',
                  // height: '29px', // Custom height in pixels

                  // border: printBtn ? '1px solid #0a4199' : '',
                }}
                icon={<PrinterOutlined />}
                disabled={!printBtn}
                onClick={onPrintBtnClick}
              >
                Print
              </Button>
            ) : null}
            {showExportBtn ? (
              <Button
                loading={loadingBtnState}
                style={{
                  // height: '29px', // Custom height in pixels

                  color: '#0a4199',
                  // border: printBtn ? '1px solid #0a4199' : '',
                }}
                icon={<UploadOutlined />}
                disabled={!exportBtn}
                onClick={onExportBtnClick}
              >
                Export
              </Button>
            ) : null}
            {showUnlockBtn ? (
              <Button
                loading={loadingBtnState}
                style={{
                  // height: '29px', // Custom height in pixels

                  color: '#0a4199',
                  // border: printBtn ? '1px solid #0a4199' : '',
                }}
                icon={<UnlockOutlined />}
                disabled={!unlockBtn}
                onClick={onUnlockBtnClick}
              >
                Unlock
              </Button>
            ) : null}
            {showUpdateBtn ? (
              <Button
                loading={loadingBtnState}
                style={{
                  // height: '29px', // Custom height in pixels

                  color: '#0a4199',
                  // border: printBtn ? '1px solid #0a4199' : '',
                }}
                icon={<CheckCircleOutlined />}
                disabled={!updateBtn}
                onClick={onUpdateBtnClick}
              >
                Update
              </Button>
            ) : null}
            {showDeleteBtn ? (
              <Button
                loading={loadingBtnState}
                type='primary'
                style={{
                  // height: '29px', // Custom height in pixels

                  backgroundColor: '#fb4d4fff',
                  color: 'white',
                }}
                icon={<DeleteOutlined />}
                disabled={!deleteBtn}
                onClick={onDeleteBtnClick}
              >
                Delete
              </Button>
            ) : null}
          </Space>
        ) : null}
        {showResetBtn ? (
          <Tooltip placement='bottom' title='Reset'>
            <Button
              loading={loadingBtnState}
              style={{
                // height: '29px', // Custom height in pixels

                backgroundColor: !resetBtn ? 'gray' : '#0a4199',
                color: 'white',
              }}
              icon={<CloseOutlined />}
              disabled={!resetBtn}
              onClick={onResetBtnClick}
            />
          </Tooltip>
        ) : null}
        {showQRCode ? (
          <Button
            loading={loadingBtnState}
            style={{
              color: '#0a4199',
              // height: '29px', // Custom height in pixels

              // color: 'white',
            }}
            icon={<DownloadOutlined />}
            disabled={!qrCodeBtn}
            onClick={onQRCodeBtnClick}
          >
            Download QR
          </Button>
        ) : null}
        {showChangePasswordBtn ? (
          <Button
            className='mx-1'
            loading={loadingBtnState}
            style={{
              color: '#0a4199',
              // height: '29px', // Custom height in pixels

              // color: 'white',
            }}
            icon={<KeyOutlined />}
            disabled={!changePasswordBtn}
            onClick={onChangePasswordBtn}
          >
            Change Password
          </Button>
        ) : null}
      </Space>
      {showDisableBtn ? (
        <Button
          className='mx-1'
          loading={loadingBtnState}
          style={{
            color: '#ff0000',
            // background: '#ff0000',
            // height: '29px', // Custom height in pixels

            // color: 'white',
          }}
          disabled={!disabledBtn}
          onClick={onDisableBtn}
        >
          Disable
        </Button>
      ) : null}
      {showEnableBtn ? (
        <Button
          className='mx-1'
          loading={loadingBtnState}
          style={{
            color: '#22C55E',
            // background: '#ff0000',
            // height: '29px', // Custom height in pixels

            // color: 'white',
          }}
          disabled={!enableBtn}
          onClick={onEnableBtn}
        >
          Enable
        </Button>
      ) : null}
      {showResetDeviceId ? (
        <Button
          className='mx-1'
          loading={loadingBtnState}
          style={{
            color: '#0a4199',
            // height: '29px', // Custom height in pixels

            // color: 'white',
          }}
          icon={<SyncOutlined />}
          disabled={!resetDeviceId}
          onClick={onResetDeviceId}
        >
          Reset Device ID
        </Button>
      ) : null}
      {showApproveBtn ? (
        <Button
          className='mx-1'
          loading={loadingBtnState}
          style={{
            color: '#0a4199',
          }}
          icon={<CheckCircleOutlined />}
          disabled={!approveBtn}
          onClick={onApproveBtn}
        >
          Approve
        </Button>
      ) : null}
      {showRejectBtn ? (
        <Button
          className='mx-1'
          loading={loadingBtnState}
          style={{
            color: 'red',
          }}
          icon={<CloseOutlined />}
          disabled={!rejectBtn}
          onClick={onRejectBtn}
        >
          Reject
        </Button>
      ) : null}
    </div>
  )
}

export default GroupBtn
