// pages/ModerationPage.jsx - Admin moderation dashboard
import { useState, useEffect } from 'react';
import { Title, Card, Badge, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text } from '@tremor/react';
import { HiOutlineBan, HiOutlineSpeakerphone, HiOutlineCheckCircle } from 'react-icons/hi';
import api from '../api';
import toast from 'react-hot-toast';

const ModerationPage = () => {
  const [data, setData] = useState({ flaggedUsers: [], flaggedMessages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/moderation/dashboard');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, userId) => {
    try {
      await api.put(`/moderation/${action}/${userId}`);
      toast.success(`User ${action}ed successfully`);
      fetchDashboard();
    } catch (err) {
      toast.error(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, height: '100%', overflowY: 'auto' }}>
        <div className="shimmer" style={{ width: 300, height: 40, marginBottom: 32, borderRadius: 8 }}></div>
        <div className="shimmer" style={{ height: 400, borderRadius: 16 }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, height: '100%', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Moderation <span className="gradient-text">Dashboard</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage flagged content and user behavior</p>
      </div>

      <div style={{ display: 'grid', gap: 32 }}>
        {/* Flagged Users Table */}
        <Card className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <Title className="!text-[var(--text-primary)] mb-4">Users requiring attention</Title>
          <Table>
            <TableHead>
              <TableRow className="border-[var(--glass-border)]">
                <TableHeaderCell className="!text-[var(--text-secondary)]">User</TableHeaderCell>
                <TableHeaderCell className="!text-[var(--text-secondary)]">Toxicity Score</TableHeaderCell>
                <TableHeaderCell className="!text-[var(--text-secondary)]">Warnings</TableHeaderCell>
                <TableHeaderCell className="!text-[var(--text-secondary)]">Status</TableHeaderCell>
                <TableHeaderCell className="!text-[var(--text-secondary)] text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.flaggedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center !text-[var(--text-muted)] py-8">
                    No flagged users found. Great job team!
                  </TableCell>
                </TableRow>
              ) : data.flaggedUsers.map((user) => (
                <TableRow key={user._id} className="border-[var(--glass-border)]">
                  <TableCell className="!text-[var(--text-primary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[var(--bg-tertiary)] flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge color={user.toxicityScore > 70 ? 'rose' : user.toxicityScore > 40 ? 'amber' : 'emerald'}>
                      {Math.round(user.toxicityScore)}/100
                    </Badge>
                  </TableCell>
                  <TableCell className="!text-[var(--text-primary)]">{user.warnings}</TableCell>
                  <TableCell>
                    {user.isMuted ? (
                      <Badge color="red" icon={HiOutlineBan}>Muted</Badge>
                    ) : (
                      <Badge color="emerald" icon={HiOutlineCheckCircle}>Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="xs" color="amber" variant="secondary" icon={HiOutlineSpeakerphone} onClick={() => handleAction('warn', user._id)}>
                        Warn
                      </Button>
                      {user.isMuted ? (
                        <Button size="xs" color="emerald" variant="secondary" onClick={() => handleAction('unmute', user._id)}>
                          Unmute
                        </Button>
                      ) : (
                        <Button size="xs" color="red" variant="secondary" icon={HiOutlineBan} onClick={() => handleAction('mute', user._id)}>
                          Mute 24h
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Recent Flagged Messages */}
        <Card className="bg-transparent border border-[var(--glass-border)] !bg-[var(--glass-bg)] backdrop-blur-xl">
          <Title className="!text-[var(--text-primary)] mb-4">Recent Toxic Messages Blocked</Title>
          <div className="flex flex-col gap-4">
            {data.flaggedMessages.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8 border border-dashed border-[var(--glass-border)] rounded-lg">
                No toxic messages tracked recently.
              </div>
            ) : data.flaggedMessages.map((msg) => (
              <div key={msg._id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">{msg.sender.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">in</span>
                    <span className="text-xs px-2 py-1 rounded bg-[var(--glass-bg)] text-[var(--neon-blue)] border border-[var(--glass-border)]">
                      {msg.chat?.chatName || 'Direct Message'}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[var(--text-primary)] text-sm mb-3 pl-4 border-l-2 border-rose-500/50 italic">
                  "{msg.content}"
                </div>
                <div className="flex gap-2 flex-wrap">
                  {msg.toxicity?.categories?.map((cat, idx) => (
                    <Badge key={idx} color="rose" size="xs">
                      {cat}
                    </Badge>
                  ))}
                  <Badge color="red" size="xs">
                    Score: {Math.round(msg.toxicity?.score * 100 || 0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModerationPage;
