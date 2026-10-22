// src/components/Confirm/DeleteConfirm.js
import Swal from 'sweetalert2'

/**
 * Reusable delete confirm
 * Usage:
 * await confirmDelete({
 *   record,
 *   title: 'Are you sure?',
 *   text: 'Do you really want to delete this record?',
 *   onDelete: async (record) => { ... },
 *   successText: 'The record has been deleted.',
 * })
 */
const confirmDelete = async ({
    record,
    title = 'Are you sure?',
    text = 'Do you really want to delete this record?',
    icon = 'warning',
    confirmButtonColor = '#d33',
    cancelButtonColor = '#3085d6',
    confirmButtonText = 'Yes, delete it!',
    cancelButtonText = 'No',
    successTitle = 'Deleted!',
    successText = 'The record has been deleted.',
    successTimer = 1200,
    onDelete,
}) => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText,
        cancelButtonText,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
            try {
                await onDelete(record)
                return true
            } catch (err) {
                Swal.showValidationMessage(
                    err?.response?.data?.message ||
                    err?.message ||
                    'Delete failed'
                )
                return false
            }
        },
    })

    if (result.isConfirmed) {
        Swal.fire({
            icon: 'success',
            title: successTitle,
            text: successText,
            showConfirmButton: false,
            timer: successTimer,
            timerProgressBar: true,
        })
        return true
    }

    return false
}

export default confirmDelete
