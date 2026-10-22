export const normalizeCategoryIds = (

    list = []

) => {


    return list

        .map(

            item =>

                item?._id ||

                item?.id

        )

        .filter(Boolean)


}
export const normalizeSubCategoryIds = (

    list = []

) => {


    return list

        .map(

            item =>
                item?._id ||
                item?.id

        )

        .filter(Boolean)


}