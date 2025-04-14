import React, { useState, useEffect } from 'react';
import Widget from '../components/Widget';
import './QuickLinks.css';

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon?: string;
}

const QuickLinks: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // Load links from storage on initial render
  useEffect(() => {
    const loadLinks = async () => {
      try {
        // Use Chrome's storage API if available, otherwise use mock data
        if (chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.get(['quickLinks'], (result) => {
            if (result.quickLinks && result.quickLinks.length > 0) {
              setLinks(result.quickLinks);
            } else {
              // Set default links
              setLinks([
                { id: 1, title: 'Google', url: 'https://google.com', icon: '🔍' },
                { id: 2, title: 'GitHub', url: 'https://github.com', icon: '💻' },
                { id: 3, title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
                { id: 4, title: 'Gmail', url: 'https://mail.google.com', icon: '✉️' }
              ]);
            }
          });
        } else {
          // Mock data for development
          setLinks([
            { id: 1, title: 'Google', url: 'https://google.com', icon: '🔍' },
            { id: 2, title: 'GitHub', url: 'https://github.com', icon: '💻' },
            { id: 3, title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
            { id: 4, title: 'Gmail', url: 'https://mail.google.com', icon: '✉️' }
          ]);
        }
      } catch (error) {
        console.error('Error loading quick links:', error);
        // Fallback to default links
        setLinks([
          { id: 1, title: 'Google', url: 'https://google.com', icon: '🔍' },
          { id: 2, title: 'GitHub', url: 'https://github.com', icon: '💻' },
          { id: 3, title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
          { id: 4, title: 'Gmail', url: 'https://mail.google.com', icon: '✉️' }
        ]);
      }
    };

    loadLinks();
  }, []);

  // Save links to storage whenever they change
  useEffect(() => {
    if (links.length > 0) {
      try {
        if (chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ quickLinks: links });
        }
      } catch (error) {
        console.error('Error saving links:', error);
      }
    }
  }, [links]);

  const addLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    
    let url = newLink.url;
    // Add https:// if not present
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    const newId = links.length > 0 ? Math.max(...links.map(link => link.id)) + 1 : 1;
    
    // Choose a random icon if none is provided
    const icons = ['🔗', '🌐', '📌', '🔖', '📱', '💼', '📂', '📊'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    setLinks([...links, { 
      id: newId, 
      title: newLink.title, 
      url: url,
      icon: randomIcon
    }]);
    
    // Reset form
    setNewLink({ title: '', url: '' });
    setShowAddForm(false);
  };

  const deleteLink = (id: number) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <Widget title="Quick Links" className="quicklinks-widget">
      <div className="quicklinks-grid">
        {links.map(link => (
          <a 
            key={link.id} 
            href={link.url} 
            className="quicklink-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="quicklink-icon">{link.icon}</div>
            <div className="quicklink-title">{link.title}</div>
            <button 
              className="quicklink-delete"
              onClick={(e) => {
                e.preventDefault();
                deleteLink(link.id);
              }}
              aria-label="Delete link"
            >
              ×
            </button>
          </a>
        ))}
        
        <button 
          className="quicklink-add-button"
          onClick={() => setShowAddForm(true)}
          style={{ display: showAddForm ? 'none' : 'flex' }}
        >
          +
        </button>
      </div>
      
      {showAddForm && (
        <form className="quicklink-form" onSubmit={addLink}>
          <input
            type="text"
            placeholder="Title"
            value={newLink.title}
            onChange={(e) => setNewLink({...newLink, title: e.target.value})}
            className="quicklink-input"
          />
          <input
            type="text"
            placeholder="URL (e.g., google.com)"
            value={newLink.url}
            onChange={(e) => setNewLink({...newLink, url: e.target.value})}
            className="quicklink-input"
          />
          <div className="quicklink-form-buttons">
            <button type="submit" className="quicklink-save-btn">Add</button>
            <button 
              type="button" 
              className="quicklink-cancel-btn"
              onClick={() => {
                setShowAddForm(false);
                setNewLink({ title: '', url: '' });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Widget>
  );
};

export default QuickLinks; 