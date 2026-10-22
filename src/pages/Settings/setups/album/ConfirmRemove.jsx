import Swal from 'sweetalert2'
import AlbumServices from '../../../../services/setup/Album'

const showAlert = ({ record, access_token, getAlbum, setLoading }) => {
  const deleteAlbum = async () => {
    setLoading(true)
    try {
      const doc = { _id: record?._id }
      const res = await AlbumServices.removeAlbum({ access_token, doc }) // Await the API call
      if (res) {
        getAlbum()
        setLoading(false)
        Swal.fire({
          icon: 'success',
          title: 'Deleted Successfully!',
          text: 'The category has been removed.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed!',
        text: 'Something went wrong while removing.',
        timer: 1500,
      })
      setLoading(false)
    }
  }

  Swal.fire({
    html: `
      <div style="text-align: center; font-family: Arial, sans-serif;">
       
        <h3 style="margin: 5px 0; font-size: 20px; color: #333;">${record?.nameEn || 'Default Title'}</h3>

        <p style="font-size: 14px; color: #777;">${record?.nameKh || 'No subtitle available'}</p>

        <p style="font-size: 14px; color: #444;">${record?.description || 'No description available'}</p>

      </div>
      <p><a href="${'/activity/detail/' + record?._id}" target="_blank" style="color: #3085d6; text-decoration: none;font-size:12px;"> View Detail </a></p>


    `,
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteAlbum()
    }
  })
}

export default showAlert
