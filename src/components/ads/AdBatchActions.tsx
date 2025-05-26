import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Portal, Dialog, TextInput, Chip } from 'react-native-paper';
import { AdBatchOperation, AdStatus } from '../../types';

interface AdBatchActionsProps {
  selectedIds: string[];
  onBatchOperation: (operation: AdBatchOperation) => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

const AdBatchActions: React.FC<AdBatchActionsProps> = ({ 
  selectedIds, 
  onBatchOperation, 
  onClearSelection,
  isLoading
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [tagsDialogVisible, setTagsDialogVisible] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<AdBatchOperation | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AdStatus>('active');
  const [tagInput, setTagInput] = useState('');
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [operationType, setOperationType] = useState<'addTags' | 'removeTags'>('addTags');

  const handleOperation = (operation: AdBatchOperation['operation']) => {
    setMenuVisible(false);
    
    switch (operation) {
      case 'delete':
        setCurrentOperation({ ids: selectedIds, operation: 'delete' });
        setConfirmDialogVisible(true);
        break;
        
      case 'archive':
        setCurrentOperation({ ids: selectedIds, operation: 'archive' });
        setConfirmDialogVisible(true);
        break;
        
      case 'changeStatus':
        setStatusDialogVisible(true);
        break;
        
      case 'addTags':
        setOperationType('addTags');
        setTagsToAdd([]);
        setTagInput('');
        setTagsDialogVisible(true);
        break;
        
      case 'removeTags':
        setOperationType('removeTags');
        setTagsToAdd([]);
        setTagInput('');
        setTagsDialogVisible(true);
        break;
    }
  };

  const confirmOperation = () => {
    if (currentOperation) {
      onBatchOperation(currentOperation);
      setConfirmDialogVisible(false);
    }
  };

  const confirmStatusChange = () => {
    onBatchOperation({
      ids: selectedIds,
      operation: 'changeStatus',
      data: { status: selectedStatus }
    });
    setStatusDialogVisible(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tagsToAdd.includes(tagInput.trim())) {
      setTagsToAdd([...tagsToAdd, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTagsToAdd(tagsToAdd.filter(t => t !== tag));
  };

  const confirmTagsOperation = () => {
    if (tagsToAdd.length > 0) {
      onBatchOperation({
        ids: selectedIds,
        operation: operationType,
        data: { tags: tagsToAdd }
      });
    }
    setTagsDialogVisible(false);
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.selectionInfo}>
        <Button 
          icon="close" 
          mode="text" 
          onPress={onClearSelection}
          disabled={isLoading}
        >
          Clear
        </Button>
        <Button 
          icon="checkbox-marked" 
          mode="text" 
          disabled
        >
          {selectedIds.length} selected
        </Button>
      </View>
      
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button 
            mode="contained" 
            onPress={() => setMenuVisible(true)}
            icon="dots-vertical"
            loading={isLoading}
            disabled={isLoading}
          >
            Batch Actions
          </Button>
        }
      >
        <Menu.Item 
          onPress={() => handleOperation('changeStatus')} 
          title="Change Status" 
          leadingIcon="flag"
        />
        <Menu.Item 
          onPress={() => handleOperation('addTags')} 
          title="Add Tags" 
          leadingIcon="tag-plus"
        />
        <Menu.Item 
          onPress={() => handleOperation('removeTags')} 
          title="Remove Tags" 
          leadingIcon="tag-remove"
        />
        <Menu.Item 
          onPress={() => handleOperation('archive')} 
          title="Archive" 
          leadingIcon="archive"
        />
        <Menu.Item 
          onPress={() => handleOperation('delete')} 
          title="Delete" 
          leadingIcon="delete"
        />
      </Menu>
      
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Confirm {currentOperation?.operation}</Dialog.Title>
          <Dialog.Content>
            {currentOperation?.operation === 'delete' ? (
              <Dialog.Content>
                Are you sure you want to delete {selectedIds.length} ad{selectedIds.length > 1 ? 's' : ''}? 
                This action cannot be undone.
              </Dialog.Content>
            ) : (
              <Dialog.Content>
                Are you sure you want to archive {selectedIds.length} ad{selectedIds.length > 1 ? 's' : ''}?
              </Dialog.Content>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={confirmOperation}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Status Change Dialog */}
      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Change Status</Dialog.Title>
          <Dialog.Content>
            <View style={styles.statusOptions}>
              {(['draft', 'scheduled', 'active', 'paused', 'completed'] as AdStatus[]).map(status => (
                <Chip
                  key={status}
                  selected={selectedStatus === status}
                  onPress={() => setSelectedStatus(status)}
                  style={styles.statusChip}
                  mode="outlined"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={confirmStatusChange}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Tags Dialog */}
      <Portal>
        <Dialog visible={tagsDialogVisible} onDismiss={() => setTagsDialogVisible(false)}>
          <Dialog.Title>
            {operationType === 'addTags' ? 'Add Tags' : 'Remove Tags'}
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.tagInputContainer}>
              <TextInput
                label="Enter tag"
                value={tagInput}
                onChangeText={setTagInput}
                style={styles.tagInput}
                right={
                  <TextInput.Icon 
                    icon="plus" 
                    onPress={handleAddTag} 
                  />
                }
                onSubmitEditing={handleAddTag}
              />
            </View>
            
            {tagsToAdd.length > 0 && (
              <View style={styles.tagsContainer}>
                {tagsToAdd.map(tag => (
                  <Chip
                    key={tag}
                    onClose={() => removeTag(tag)}
                    style={styles.tagChip}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTagsDialogVisible(false)}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={confirmTagsOperation}
              disabled={tagsToAdd.length === 0}
            >
              {operationType === 'addTags' ? 'Add Tags' : 'Remove Tags'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 16,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusChip: {
    margin: 4,
  },
  tagInputContainer: {
    marginBottom: 16,
  },
  tagInput: {
    backgroundColor: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    margin: 4,
  },
});