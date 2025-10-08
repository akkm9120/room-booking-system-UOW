import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../services/roomService';
import { useForm } from 'react-hook-form';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  MapPin,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Rooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const queryClient = useQueryClient();

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getAllRooms,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const createMutation = useMutation({
    mutationFn: roomService.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      toast.success('Room created successfully');
      setShowModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create room');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomService.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      toast.success('Room updated successfully');
      setShowModal(false);
      setEditingRoom(null);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update room');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roomService.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      toast.success('Room deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete room');
    },
  });

  const handleCreateRoom = () => {
    setEditingRoom(null);
    reset();
    setShowModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    reset({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      description: room.description,
      equipment: room.equipment,
    });
    setShowModal(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      deleteMutation.mutate(roomId);
    }
  };

  const onSubmit = (data) => {
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredRooms = rooms?.data?.filter(room =>
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Building className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load rooms</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
        <button
          onClick={handleCreateRoom}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Room
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms by name or location..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {room.location}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditRoom(room)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Room"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Room"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  Capacity: {room.capacity} people
                </div>

                {room.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {room.description}
                  </p>
                )}

                {room.equipment && (
                  <div className="text-sm text-gray-600">
                    <strong>Equipment:</strong> {room.equipment}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    room.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </span>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="btn-sm bg-red-600 hover:bg-red-700 text-white"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingRoom(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Room Name</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Conference Room A"
                  {...register('name', { required: 'Room name is required' })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  min="1"
                  className={`form-input ${errors.capacity ? 'border-red-500' : ''}`}
                  placeholder="e.g., 10"
                  {...register('capacity', { 
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' }
                  })}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className={`form-input ${errors.location ? 'border-red-500' : ''}`}
                  placeholder="e.g., Building A, Floor 2"
                  {...register('location', { required: 'Location is required' })}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input h-20 resize-none"
                  placeholder="Brief description of the room..."
                  {...register('description')}
                />
              </div>

              <div>
                <label className="form-label">Equipment</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Projector, Whiteboard, WiFi"
                  {...register('equipment')}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRoom(null);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="btn-primary"
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? 'Saving...'
                    : editingRoom
                    ? 'Update Room'
                    : 'Create Room'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;