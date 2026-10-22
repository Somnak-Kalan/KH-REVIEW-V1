import BreadcrumbWidget from '../../../../widgets/PageHeader'
export default function FollowUpHeader() {
    return (
        <BreadcrumbWidget
            items={[
                { title: 'Home' },
                { title: 'User' },
            ]}
        />
    )
}
