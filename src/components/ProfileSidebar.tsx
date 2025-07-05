import React from 'react';
import { User as UserIcon, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileSidebarProps {
  profile: any;
  user: any;
  editMode: boolean;
  setEditMode: (val: boolean) => void;
  updatedProfile: any;
  setUpdatedProfile: (profile: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProfileUpdate: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  user,
  editMode,
  setEditMode,
  updatedProfile,
  setUpdatedProfile,
  handleInputChange,
  handleProfileUpdate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 px-6 py-8 text-center">
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-full bg-purple-200 flex items-center justify-center mx-auto ring-4 ring-purple-100">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username || 'Profile'}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-12 w-12 text-purple-700" />
            )}
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mt-4">
          {profile?.full_name || 'User'}
        </h2>
        <p className="text-purple-200">
          @{profile?.username || 'username'}
        </p>
      </div>
      {!editMode ? (
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Profile Info</h3>
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center text-sm text-purple-600 hover:text-purple-800"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-800">{profile?.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p className="text-gray-800">{profile?.bio || 'No bio provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              {profile?.website ? (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800"
                >
                  {profile.website}
                </a>
              ) : (
                <p className="text-gray-800">Not specified</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Preferred Currency</p>
              <p className="text-gray-800">{profile?.preferred_currency || 'USD'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-gray-800">{new Date(profile?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
            <button
              onClick={() => setEditMode(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-700 font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={updatedProfile?.username || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={updatedProfile?.full_name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm text-gray-700 font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={updatedProfile?.location || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm text-gray-700 font-medium mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={updatedProfile?.bio || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm text-gray-700 font-medium mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={updatedProfile?.website || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <button
                onClick={handleProfileUpdate}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link
            to="/sell"
            className="flex items-center text-purple-700 hover:text-purple-900 font-medium"
          >
            <span className="mr-2">🛒</span>
            List an Item
          </Link>
          <Link
            to="/post-job"
            className="flex items-center text-purple-700 hover:text-purple-900 font-medium"
          >
            <span className="mr-2">💼</span>
            Post a Job
          </Link>
          <Link
            to="/post-service"
            className="flex items-center text-purple-700 hover:text-purple-900 font-medium"
          >
            <span className="mr-2">🔧</span>
            Offer a Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
