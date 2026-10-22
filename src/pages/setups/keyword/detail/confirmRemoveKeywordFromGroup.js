const handleDeleteKeyword = async (record) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete "${record.nameEn}" permanently?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#1677ff',
    })

    if (!result.isConfirmed) return

    setKeywords((prev) => prev.filter((item) => item._id !== record._id))

    await Swal.fire({
        title: 'Deleted!',
        text: 'Keyword has been deleted permanently.',
        icon: 'success',
        timer: 1300,
        showConfirmButton: false,
    })
}