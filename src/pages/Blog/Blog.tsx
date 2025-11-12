import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Typography, Breadcrumb, Input, List, Avatar } from 'antd';
import { HomeOutlined, SearchOutlined, UserOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const Blog: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      image: '/img/blog-img/1.jpg',
      date: 'Jan 02, 2023',
      title: 'Best Rooms in the World',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque...',
      author: 'John Doe',
      comments: 5
    },
    {
      id: 2,
      image: '/img/blog-img/2.jpg',
      date: 'Jan 03, 2023',
      title: 'Discover Luxury Hotel',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque...',
      author: 'Jane Smith',
      comments: 3
    },
    {
      id: 3,
      image: '/img/blog-img/3.jpg',
      date: 'Jan 04, 2023',
      title: 'Travel Experience',
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada lorem maximus mauris sceleri sque...',
      author: 'Mike Johnson',
      comments: 7
    }
  ];

  const categories = ['Travel', 'Lifestyle', 'Hotel', 'Vacation', 'Restaurant'];

  const handleSearch = (value: string) => {
    console.log('Search:', value);
  };

  return (
    <div>
      {/* Breadcrumb Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 1,
          height: '400px',
          backgroundImage: "url('/img/bg-img/20.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: -1,
          }}
        />
        <div style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
          <Title level={1} style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem' }} data-aos="fade-up">
            Blog
          </Title>
          <Breadcrumb
            data-aos="fade-up"
            data-aos-delay="200"
            style={{ justifyContent: 'center', display: 'flex' }}
            items={[
              {
                title: (
                  <Link to="/" style={{ color: '#cb8670' }}>
                    <HomeOutlined /> Home
                  </Link>
                ),
              },
              {
                title: <span style={{ color: '#fff' }}>Blog</span>,
              },
            ]}
          />
        </div>
      </section>

      {/* Blog Content Section */}
      <section style={{ padding: '100px 0 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              {blogPosts.map((post, index) => (
                <Card
                  key={post.id}
                  style={{
                    marginBottom: '100px',
                    border: 'none',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                  }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  cover={<img alt={post.title} src={post.image} style={{ height: '400px', objectFit: 'cover' }} />}
                >
                  <div style={{ marginBottom: '20px' }}>
                    <Text style={{ color: '#6c757d', marginRight: '10px' }}>
                      <CalendarOutlined /> {post.date}
                    </Text>
                    <Text style={{ color: '#6c757d', marginRight: '10px' }}>
                      <UserOutlined /> By {post.author}
                    </Text>
                    <Text style={{ color: '#6c757d' }}>
                      <MessageOutlined /> {post.comments} Comments
                    </Text>
                  </div>
                  <Title level={2} style={{ marginBottom: '20px', color: '#2a2a2a' }}>
                    {post.title}
                  </Title>
                  <Paragraph style={{ marginBottom: '30px', color: '#6c757d', fontSize: '16px' }}>
                    {post.excerpt}
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#cb8670',
                      borderColor: '#cb8670',
                      height: '50px',
                      padding: '0 40px',
                    }}
                  >
                    Read More
                  </Button>
                </Card>
              ))}
            </Col>

            <Col xs={24} lg={8}>
              {/* Search Widget */}
              <Card
                style={{ marginBottom: '40px', border: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                data-aos="fade-up"
              >
                <Search
                  placeholder="Search..."
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  size="large"
                />
              </Card>

              {/* Categories Widget */}
              <Card
                title="Categories"
                style={{ marginBottom: '40px', border: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                headStyle={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}
                data-aos="fade-up"
              >
                <List
                  dataSource={categories}
                  renderItem={(item) => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <Link to="#" style={{ color: '#6c757d', transition: 'color 0.3s' }}>
                        {item}
                      </Link>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Recent Posts Widget */}
              <Card
                title="Recent Posts"
                style={{ marginBottom: '100px', border: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
                headStyle={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}
                data-aos="fade-up"
              >
                <List
                  dataSource={blogPosts}
                  renderItem={(post) => (
                    <List.Item style={{ padding: '12px 0', alignItems: 'flex-start' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            size={80}
                            src={post.image}
                            style={{ borderRadius: '4px' }}
                          />
                        }
                        title={
                          <Link to="#" style={{ color: '#2a2a2a', transition: 'color 0.3s' }}>
                            {post.title}
                          </Link>
                        }
                        description={
                          <Text style={{ color: '#6c757d', fontSize: '14px' }}>
                            <CalendarOutlined /> {post.date}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Blog;