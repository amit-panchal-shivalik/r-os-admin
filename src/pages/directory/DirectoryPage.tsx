import React from 'react';

const DirectoryPage: React.FC = () => {
  return (
    <div className="directory-page">
      <div className="page-header">
        <h1>Member Directory</h1>
        <p>Browse members across all your communities</p>
      </div>

      <div className="empty-state">
        <p>Select a community to view its member directory.</p>
        <p>Go to Communities → Select a Community → Directory Tab</p>
      </div>
    </div>
  );
};

export default DirectoryPage;
