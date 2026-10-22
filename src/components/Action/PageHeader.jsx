import BreadcrumbWidget from '../../widgets/PageHeader'

export default function FollowUpHeader(props) {
    const {
        mainPageName = '',
        childName = '',
        secondChildName = '',
    } = props

    const items = [
        { title: mainPageName },
        { title: childName },
        { title: secondChildName },
    ].filter(item => item.title && item.title.trim() !== '')

    return <BreadcrumbWidget items={items} />
}