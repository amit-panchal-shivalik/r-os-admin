import React, { useState, useEffect } from 'react';
import { directoryAPI } from '../../api/directory';
import { Member } from '../../types';

interface MemberDirectoryProps {
  communityId: string;
  isManager?: boolean;
}

const MemberDirectory: React.FC<MemberDirectoryProps> = ({ communityId, isManager }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, [communityId]);

  const loadMembers = async () => {
    try {
      const response = await directoryAPI.getMembers(communityId);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!window.confirm('Are you sure you want to block this member?')) return;
    
    try {
      await directoryAPI.blockMember(communityId, userId);
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to block member');
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await directoryAPI.unblockMember(communityId, userId);
      loadMembers();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to unblock member');
    }
  };

  const filteredMembers = members.filter(member =>
    member.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="member-directory">
      <div className="directory-header">
        <h3>Member Directory ({members.length})</h3>
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <div className="member-grid">
          {filteredMembers.map((member) => (
            <div key={member._id} className={`member-card status-${member.status}`}>
              <div className="member-info">
                <h4>{member.user?.name}</h4>
                <p className="member-email">{member.user?.email}</p>
                <p className="member-phone">{member.user?.phone}</p>
                <span className={`role-badge ${member.role}`}>{member.role}</span>
                {member.status === 'blocked' && (
                  <span className="status-badge blocked">Blocked</span>
                )}
              </div>

              {isManager && member.role !== 'manager' && (
                <div className="member-actions">
                  {member.status === 'active' ? (
                    <button
                      onClick={() => handleBlock(member.userId)}
                      className="btn-danger"
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnblock(member.userId)}
                      className="btn-secondary"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
