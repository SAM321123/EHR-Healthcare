/* eslint-disable no-unused-vars */
import { isEmpty } from 'lodash';
import Container from 'src/components/Container';
import { dateFormats } from 'src/lib/constants';
import { dateFormatter, getFullName } from 'src/lib/utils';

const EncounterNoteList = ({ notes, emptyMessage = 'No Encounter Notes Found' }) => {
  return (
    <Container
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div>
        <div
          style={{
            maxHeight: '250px',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#f5f7fb',
            borderRadius: '8px',
            margin: '2px 0',
          }}
        >
          {isEmpty(notes) ? (
            <div style={{ textAlign: 'center', color: '#888' }}>
              {emptyMessage}
            </div>
          ) : (
            notes.map((note) => {
              const noteAuthor = getFullName(note.createdBy || {}) || 'Unknown User';
              const noteRoles = note?.createdBy?.roles?.map((role) => role?.name).filter(Boolean).join(', ');
              const noteAuthorLabel = noteRoles ? `${noteAuthor} (${noteRoles})` : noteAuthor;
              const noteTimestamp =
                dateFormatter(note.createdAt, dateFormats.MMMDDYYYYHHMMSS) || 'N/A';

              return (
                <div
                  key={note.id}
                  style={{
                    alignSelf: 'stretch',
                    background: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    maxWidth: '100%',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    wordBreak: 'break-word',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      marginBottom: '10px',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {note.description}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>{noteAuthorLabel}</span>
                    <span>{noteTimestamp}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
};

export default EncounterNoteList;
