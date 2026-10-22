import { useState, useEffect, useContext } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Tag,
  Typography,
  Skeleton,
  Breadcrumb,
  Empty,
} from 'antd';
import {
  HomeOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

import CoverImage from '../../../../components/post/banner/other/Cover';

import { AuthContext } from '../../../../contexts/AuthContext';
import helpFunctions from '../../../../utils/helpFunctions';
import BannerService from '../../../../services/post/banner/Banner';

const { Title, Text, Paragraph } = Typography;

const cardStyle = {
  borderRadius: 8,
  border: '1px solid #E2EFFF',
  background: '#fff',
};

// Business logo component
const BusinessLogo = ({ category, imageUrl, businessName, businessNameKh }) => (
  <div className="flex items-center space-x-2">
    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
      <img
        src={
          imageUrl
            ? imageUrl
            : 'https://placehold.co/48x48/F3F4F6/9CA3AF?text=Logo'
        }
        alt={`${businessName} logo`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop if fallback also fails
          e.target.src =
            'https://placehold.co/48x48/F3F4F6/9CA3AF?text=Logo';
        }}
      />
    </div>
    <div className="flex flex-col">
      <Text strong className="text-sm">
        {businessName || 'N/A'}
      </Text>
      <Text type="secondary" className="text-xs">
        {businessNameKh}
        {/* {category || 'N/A'} */}
      </Text>
    </div>
  </div>
);

const BannerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { access_token, checkPermission } = useContext(AuthContext);
  const { getFileByNewUrl, getFileByName, getFileImage } = helpFunctions;
  const { collapsed, setDisplayEmitContent } = useOutletContext();

  const [bannerDetail, setBannerDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    navigate('/banner');
  };

  const getBannerDetailById = async () => {
    if (!id) return;
    try {
      const res = await BannerService.fetchBannerDetailById({
        bannerId: id,
        access_token,
      });

      // Support both shapes: { success, data } or plain banner object
      const banner = res?.data || res;

      setBannerDetail(banner || null);
    } catch (error) {
      console.error('Error fetching banner detail:', error);
      setBannerDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBannerDetailById();
  }, [id]);

  useEffect(() => {
    setDisplayEmitContent(
      <div className="my-2">
        <Row
          align="middle"
          justify="space-between"
          className="bg-white rounded-md px-4 py-2"
        >
          <Col>
            <div
              className="inline-flex items-center space-x-2 cursor-pointer"
              onClick={handleBack}
            >
              <ArrowLeftOutlined />
              <span
                style={{ fontWeight: 600, color: '#111827' }}
              >{`Back to Banners`}</span>
            </div>
          </Col>
          <Col>
            <Breadcrumb
              items={[
                {
                  title: (
                    <HomeOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/')}
                    />
                  ),
                },
                { title: 'Post' },
                { title: 'Banner' },
                { title: 'Banner Detail' },
              ]}
            />
          </Col>
        </Row>
      </div>
    );
  }, [navigate, setDisplayEmitContent]);

  // Helper: format schedule values safely
  const schedule = bannerDetail?.schedule || {};
  const now = dayjs();

  const startDateFormatted = schedule.startDate
    ? dayjs(schedule.startDate).format('MMM DD, YYYY [at] hh:mm:ss A')
    : 'N/A';

  const endDateFormatted = schedule.endDate
    ? dayjs(schedule.endDate).format('MMM DD, YYYY [at] hh:mm:ss A')
    : 'N/A';

  let durationText = 'N/A';
  if (schedule.startDate && schedule.endDate) {
    const start = dayjs(schedule.startDate);
    const end = dayjs(schedule.endDate);
    const days = end.diff(start, 'day');
    durationText = `${days} day${days !== 1 ? 's' : ''}`;
  }

  let timeLeftText = 'N/A';
  if (schedule.endDate) {
    const end = dayjs(schedule.endDate);
    if (end.isAfter(now)) {
      const diff = end.diff(now, 'second');
      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      timeLeftText = `${days} day${days !== 1 ? 's' : ''}, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    } else {
      timeLeftText = 'Completed';
    }
  }

  // Targeting helpers
  const targetPlace = bannerDetail?.targeting?.place;
  const targetProvinces = bannerDetail?.targeting?.provinces || [];
  const targetUsers = bannerDetail?.targeting?.users || [];

  // Image helpers from new API shape

  const smallEn = bannerDetail?.image?.small?.en;
  const smallKm = bannerDetail?.image?.small?.km;
  const largeEn = bannerDetail?.image?.large?.en;
  const largeKm = bannerDetail?.image?.large?.km;

  // Action helper
  const action = bannerDetail?.action || {};

  const actionButtonLabel =
    action?.buttonTitle?.en ||
    action?.buttonTitle?.kh ||
    ''; // no default text, use only what API sends
  const actionButtonLabelKh =
    action?.buttonTitle?.kh ||
    ''; // no default text, use only what API sends
  const isActionButton =
    action?.type === 'ActionButton' || action?.type === 'Action Button';

  const targetDetail = action?.targetDetail || {};
  const targetDetailNameEn = targetDetail.nameEn || targetDetail.provinceEn || targetDetail?.username;
  const targetDetailNameKh = targetDetail.nameKh || targetDetail.provinceKh || targetDetail?.username;

  return (
    <div className="mt-3">
      {loading ? (
        <Card>
          <Skeleton active />
        </Card>
      ) : !bannerDetail ? (
        <Empty description="No banner detail found" />
      ) : (
        <>
          <div className="mx">
            {/* Schedule Card */}
            <Card
              style={{ ...cardStyle }}
              title={
                <div className="flex items-center text-md font-semibold text-gray-800">
                  <ClockCircleOutlined className="mr-2" />
                  Advertisement Schedule
                </div>
              }
              className="rounded-lg shadow-lg my-2 mb-4"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text className="text-sm font-medium text-gray-700">
                    Schedule Enabled:
                  </Text>
                  <Text className="font-semibold">
                    {schedule.enabled ? 'Yes' : 'No'}
                  </Text>
                </div>

                {/* Schedule Type */}
                <div className="flex justify-between items-center">
                  <Text className="text-sm font-medium text-gray-700">
                    Schedule Type:
                  </Text>
                  <Text className="font-semibold">
                    {schedule.type || 'N/A'}
                  </Text>
                </div>

                {/* Specific Days */}
                {schedule.specificDays !== undefined &&
                  schedule.specificDays !== null && (
                    <div className="flex justify-between items-center">
                      <Text className="text-sm font-medium text-gray-700">
                        Specific Days:
                      </Text>
                      <Text className="font-semibold">
                        {schedule.specificDays}
                      </Text>
                    </div>
                  )}

                <div className="flex justify-between items-center">
                  <Text className="text-sm font-medium text-gray-700">
                    Starts:
                  </Text>
                  <Text className="font-semibold">{startDateFormatted}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-sm font-medium text-gray-700">
                    Ends:
                  </Text>
                  <Text className="font-semibold">{endDateFormatted}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-sm font-medium text-gray-700">
                    Duration:
                  </Text>
                  <Text className="font-semibold">{durationText}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-sm font-medium text-gray-700">
                    Time Left:
                  </Text>
                  <Text className="font-semibold text-green-500">
                    {timeLeftText}
                  </Text>
                </div>
              </div>
            </Card>

            <div className="rounded-lg shadow-sm">
              <Row gutter={[0, 8]}>
                {/* Left: Banner Preview / Cover */}
                <Col
                  xs={24}
                  sm={12}
                  md={6}
                  style={{ ...cardStyle }}
                >
                  <Card style={{ border: 'none' }}>
                    <div className="flex justify-center">
                      <div className="w-full">
                        {/* Update CoverImage implementation to accept these URLs if needed */}
                        <CoverImage
                          // You can adjust CoverImage props to work directly with full URLs
                          filePathLargeEn={largeEn?.url}
                          filePathLargeKh={largeKm?.url}
                          filePathSmallEn={smallEn?.url}
                          filePathSmallKh={smallKm?.url}
                          largeImageEn={largeEn?.url}
                          largeImageKh={largeKm?.url}
                          smallImageEn={smallEn?.url}
                          smallImageKh={smallKm?.url}
                          getFileImage={getFileImage}
                        />
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Right: Details */}
                <Col
                  xs={24}
                  sm={12}
                  md={18}
                  style={{ ...cardStyle }}
                >
                  <Card style={{ marginBottom: '20px', border: 'none' }}>
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={24} md={8}>
                        <Card size="small" style={cardStyle}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Banner EN
                          </Text>
                          <Paragraph style={{ margin: 0 }}>
                            {bannerDetail?.title?.en || 'N/A'}
                          </Paragraph>
                        </Card>
                      </Col>
                      <Col xs={24} sm={24} md={8}>
                        <Card size="small" style={cardStyle}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Banner KH
                          </Text>
                          <Paragraph style={{ margin: 0 }}>
                            {bannerDetail?.title?.kh || 'N/A'}
                          </Paragraph>
                        </Card>
                      </Col>
                      <Col xs={24} sm={24} md={8}>
                        <Card size="small" style={cardStyle}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Status
                          </Text>
                          <Paragraph style={{ margin: 0 }}>
                            {bannerDetail?.status || 'N/A'}
                          </Paragraph>
                        </Card>
                      </Col>

                      <Col xs={24} sm={24} md={8}>
                        <Card size="small" style={cardStyle}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Type
                          </Text>
                          <Paragraph style={{ margin: 0 }}>
                            {bannerDetail?.type || 'N/A'}
                          </Paragraph>
                        </Card>
                      </Col>

                      <Col xs={24} sm={24} md={8}>
                        <Card size="small" style={cardStyle}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created By
                          </Text>
                          <Paragraph style={{ margin: 0 }}>
                            {bannerDetail?.createdBy || 'N/A'}
                          </Paragraph>
                        </Card>
                      </Col>

                      <Col xs={24} sm={24} md={8}>
                        <Card size="small" style={cardStyle}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created At
                          </Text>
                          <Paragraph style={{ margin: 0 }}>
                            {bannerDetail?.createdAt
                              ? dayjs(bannerDetail.createdAt).format(
                                'MMM DD, YYYY'
                              )
                              : 'N/A'}
                          </Paragraph>
                        </Card>
                      </Col>

                      {/* Target Place */}
                      <Col xs={24}>
                        <Card size="small" style={cardStyle}>
                          <BusinessLogo
                            // category="Accommodation"
                            imageUrl={targetPlace?.image}
                            businessName={
                              targetPlace?.nameEn || targetPlace?.nameKh
                                ? `${targetPlace?.nameEn || ''}

                                `
                                : 'N/A'
                            }
                            businessNameKh={targetPlace?.nameKh}
                          />
                        </Card>
                      </Col>
                      <Col xs={24}>
                        <Card size="small" style={cardStyle}>
                          <div className="flex items-center justify-between">
                            <div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Action Type
                              </Text>
                              <div>
                                <Text strong>{action?.type || 'N/A'}</Text>
                              </div>


                            </div>



                            {action?.type === 'Chat Support' && (
                              <button
                                type="button"
                                className="
            inline-flex items-center px-4 py-2
            rounded-full shadow
            bg-white border border-blue-400
            text-blue-500 text-sm font-semibold
          "
                              >
                                Chat Support
                              </button>
                            )}

                            {action?.type === 'DetailOnly' && (
                              <Tag color="blue">Detail Only</Tag>
                            )}
                          </div>
                        </Card>
                      </Col>


                      {/* Target Detail card - using nameEn/nameKh or provinceEn/provinceKh */}
                      {targetDetailNameEn || targetDetailNameKh ? (
                        <Col xs={24}>
                          <Card size="small" style={cardStyle}>
                            {action?.targetScreen && (
                              <div className=" text-xs  mb-3 text-gray-500">
                                Target Screen: {action.targetScreen}
                              </div>
                            )}
                            <BusinessLogo
                              // use image if you have one in targetDetail
                              imageUrl={targetDetail.image}
                              businessName={targetDetailNameEn || 'N/A'}
                              businessNameKh={targetDetailNameKh}
                            />
                          </Card>
                        </Col>
                      ) : null}
                      <Col xs={24}>
                        {isActionButton && (
                          <button
                            type="button"
                            className="
        flex items-center justify-center
        px-6 py-2 rounded-full shadow-md
        bg-gradient-to-r from-[#FF6A88] via-[#FF9A5A] to-[#FFCC70]
        text-white font-semibold
      "
                          >
                            <span
                              className="
          flex flex-col items-center justify-center
          leading-tight
        "
                            >
                              {/* English text (top) */}
                              <span className="text-sm tracking-wide uppercase">
                                {actionButtonLabel}
                              </span>

                              {/* Khmer text (below, smaller) */}
                              {actionButtonLabelKh && (
                                <span className="text-[10px] opacity-90 mt-0.5">
                                  {actionButtonLabelKh}
                                </span>
                              )}
                            </span>
                          </button>
                        )}
                      </Col>


                      {/* //show it we have 3  */}
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Description */}
              <Col xs={24} className="my-2">
                <Card size="small" style={cardStyle}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Description
                  </Text>

                  {/* English description */}
                  {bannerDetail?.description?.en ? (
                    <div
                      className="m-0 p-0 text-gray-500"
                      style={{ margin: 0 }}
                      dangerouslySetInnerHTML={{
                        __html: bannerDetail.description.en,
                      }}
                    />
                  ) : (
                    <span className="text-[10px] p-0 m-0">
                      No description EN
                    </span>
                  )}

                  {/* Khmer description */}
                  {bannerDetail?.description?.kh ? (
                    <div
                      className="p-0 m-0 text-gray-500"
                      style={{ margin: 0 }}
                      dangerouslySetInnerHTML={{
                        __html: bannerDetail.description.kh,
                      }}
                    />
                  ) : (
                    <span className="text-[10px] p-0 m-0">
                      No description KH
                    </span>
                  )}
                </Card>
              </Col>

              {/* Province list + User list BELOW description */}
              <Col xs={24} className="my-2">
                <Card size="small" style={cardStyle}>
                  {/* Province list */}
                  <div className="mb-3">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Province List
                    </Text>
                    {targetProvinces.length > 0 ? (
                      <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
                        {targetProvinces.map((p) => (
                          <li key={p.id}>
                            {p.nameEn || 'No name EN'}
                            {p.nameKh ? ` - ${p.nameKh}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">
                        No provinces selected
                      </div>
                    )}
                  </div>

                  {/* User list */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      User List
                    </Text>
                    {targetUsers.length > 0 ? (
                      <ul className="mt-1 list-disc pl-5 text-sm text-gray-700">
                        {targetUsers.map((u) => (
                          <li key={u.id}>
                            {u.username || u.id || 'Unknown user'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 text-xs text-gray-400">
                        No users targeted
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BannerDetail;
