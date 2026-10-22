import httpCommon from '../../../utils/http-common'
const ListTemplateReview = async (payload = {}) => {
    try {
        const response =
            await httpCommon.get(
                '/review-templates',
                {
                    params:
                        payload?.doc || {},
                    headers: {
                        Authorization:
                            `Bearer ${payload?.access_token}`,
                    },
                }
            )

        return response.data
    } catch (error) {
        console.error(
            'Error fetching review templates:',
            error.response?.data ||
            error.message
        )

        throw error
    }
}

const GetTemplateReviewById =
    async (payload = {}) => {
        try {
            const response =
                await httpCommon.get(
                    `/review-templates/${payload?.doc?._id}`,
                    {
                        params:
                            payload?.doc?.params ||
                            {},
                        headers: {
                            Authorization:
                                `Bearer ${payload?.access_token}`,
                        },
                    }
                )

            return response.data
        } catch (error) {
            console.error(
                'Error fetching review template detail:',
                error.response?.data ||
                error.message
            )

            throw error
        }
    }

const TemplateReviewServices = {
    ListTemplateReview,
    GetTemplateReviewById,
}

export default TemplateReviewServices