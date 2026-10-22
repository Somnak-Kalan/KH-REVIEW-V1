import React from 'react'
import Swal from 'sweetalert2'
import helpFunctions from '../../utils/helpFunctions'
import BannerService from '../../services/post/banner/Banner'

const showAlert = ({ record, access_token, getBannerList }) => {
    const { getFileByNewUrl } = helpFunctions
    Swal.fire({
        title: `
      <div style="font-size:18px; line-height:0.5;">
        ${record?.titleEn || 'Default Title EN'}
        <br>
        <small style="color:#888;">${record?.titleKh || 'Default Title KH'}</small>
      </div>
    `,
        html: `
      <p style="margin-top:15px; font-size:14px; color:#d33; font-weight:500;">
        ⚠️ This action cannot be undone!
      </p>
    `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded-xl shadow-lg',
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const res = await BannerService.deleteBannerById({ id: record._id, access_token })
                if (res) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'The banner has been deleted.',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    })
                    getBannerList()
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete the banner.',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    })
                }
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong. Please try again.',
                })
            }
        }
    })
}

export default showAlert


