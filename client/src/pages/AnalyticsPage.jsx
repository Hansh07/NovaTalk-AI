// pages/AnalyticsPage.jsx - Dashboard for team analytics
import { useState, useEffect } from 'react';
import { Title, Text, Card, AreaChart, BarChart, DonutChart, Grid, Metric } from '@tremor/react';
import { HiOutlineUserGroup, HiOutlineChatAlt2, HiOutlineSparkles, HiOutlineTrendingUp } from 'react-icons/hi';
import api from '../api';

const AnalyticsPage = () => {
  const [data, setData] = useState({ activeUsers: [], sentimentTrends: [], heatmapData: [], totalMessages: 0, collaborationIndex: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/team?days=7');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, height: '100%', overflowY: 'auto' }}>
        <div className="shimmer" style={{ width: 200, height: 32, marginBottom: 32, borderRadius: 8 }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 12 }}></div>)}
        </div>
        <div className="shimmer" style={{ height: 400, borderRadius: 16 }}></div>
      </div>
    );
  }

  // Format sentiment data for Tremor chart
  const sentimentData = data.sentimentTrends.map(item => ({
    date: item._id,
    Positive: item.positive,
    Negative: item.negative,
    Neutral: item.neutral,
  }));

  // Format active users for Donut chart
  const usersData = data.activeUsers.map(u => ({
    name: u.name,
    messages: u.totalMessages,
  }));

  return (
    <div style={{ padding: 40, height: '100%', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Team <span className="gradient-text">Analytics</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Insights and engagement metrics for the last 7 days</p>
      </div>

      {/* Metrics Row */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6 mb-8">
        <Card decoration="top" decorationColor="blue" className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(0, 212, 255, 0.1)', padding: 10, borderRadius: 10 }}><HiOutlineChatAlt2 size={24} color="#00d4ff" /></div>
            <Text className="!text-[var(--text-secondary)]">Total Messages</Text>
          </div>
          <Metric className="!text-[var(--text-primary)]">{data.totalMessages.toLocaleString()}</Metric>
        </Card>
        
        <Card decoration="top" decorationColor="purple" className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 10, borderRadius: 10 }}><HiOutlineUserGroup size={24} color="#a855f7" /></div>
            <Text className="!text-[var(--text-secondary)]">Active Users</Text>
          </div>
          <Metric className="!text-[var(--text-primary)]">{data.activeUsers.length}</Metric>
        </Card>

        <Card decoration="top" decorationColor="emerald" className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 10 }}><HiOutlineTrendingUp size={24} color="#10b981" /></div>
            <Text className="!text-[var(--text-secondary)]">Collaboration Index</Text>
          </div>
          <Metric className="!text-[var(--text-primary)]">{data.collaborationIndex}%</Metric>
        </Card>

        <Card decoration="top" decorationColor="pink" className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: 10, borderRadius: 10 }}><HiOutlineSparkles size={24} color="#ec4899" /></div>
            <Text className="!text-[var(--text-secondary)]">AI Productivity</Text>
          </div>
          <Metric className="!text-[var(--text-primary)]">
            {data.activeUsers.length > 0 
              ? Math.round(data.activeUsers.reduce((sum, u) => sum + u.avgProductivity, 0) / data.activeUsers.length)
              : 0}/100
          </Metric>
        </Card>
      </Grid>

      {/* Charts Row */}
      <Grid numItemsLg={3} className="gap-6 mt-8">
        <Card className="col-span-2 bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <Title className="!text-[var(--text-primary)]">Sentiment Trends (AI Analyzed)</Title>
          <AreaChart
            className="h-72 mt-4"
            data={sentimentData}
            index="date"
            categories={["Positive", "Neutral", "Negative"]}
            colors={["emerald", "slate", "rose"]}
            valueFormatter={(number) => number.toString()}
            showAnimation={true}
          />
        </Card>

        <Card className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <Title className="!text-[var(--text-primary)]">Top Contributors</Title>
          <DonutChart
            className="h-52 mt-6"
            data={usersData}
            category="messages"
            index="name"
            colors={["blue", "cyan", "indigo", "violet", "fuchsia", "purple"]}
            valueFormatter={(number) => number.toString()}
            showAnimation={true}
          />
          
          <div className="mt-6 flex flex-col gap-2">
            {data.activeUsers.slice(0, 3).map((user, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">{user.name}</span>
                <span className="text-[var(--text-primary)] font-semibold">{user.totalMessages} msgs</span>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
      
      {/* We need Tremor dependency for these charts, let me install it in background */}
    </div>
  );
};

export default AnalyticsPage;
