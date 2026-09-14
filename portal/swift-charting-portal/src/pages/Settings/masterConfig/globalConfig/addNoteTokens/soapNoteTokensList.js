import { IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import Typography from 'src/components/Typography';
import editIcon from 'src/assets/images/edit.png';
import ModalComponent from 'src/components/modal';
import AddSoapNoteTokens from './addSoapNoteTokens';
import { clone, isEmpty } from 'lodash';



const SoapNoteTokensList = ({ outerForm } = {}) => {

  const [list, setList] = useState([]);
  const [show,setShow] = useState(false);
  const [editData,setEditData] = useState({});
  

  useEffect(() => {
    const defaultData = outerForm.getValues('metaData') || [];
    setList(defaultData);
  }, []);

  const showAddModal = ()=>{
    setShow(true);
  }
  const closeAddModal = ()=>{
    setShow(false);
    setEditData({});
  }
  const handleEdit = (data,index)=>{
    setEditData({data,index});
    showAddModal();
  }

  useEffect(()=>{
    if(outerForm){
    outerForm.setValue('metaData',list)
    }
  },[list])
  const onSave = (formData,index)=>{
    if(index || index===0){
      let oldList = clone(list);
      oldList = oldList.map((item,_index)=>{
        if(index ===_index){
          return formData;
        }
        return item
      })
      setList(oldList)
    }else{
      setList(pre=>[...pre,formData])
    }
    closeAddModal()
  }
  return (
    <div style={{marginTop:20,width:'100%'}}>
        <div style={{display:'flex',justifyContent:'flex-end'}}><LoadingButton label={'Add Token'} onClick={showAddModal}/></div>
        <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:10}}>
        {list.map((item,index) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  whiteSpace: 'nowrap',
                  alignItems:'baseline'
                }}
              >
                <div

                >
                  <Typography
                    style={{ fontWeight: 600, fontSize: 15 }}
                  >{`${item.label}: `}</Typography>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 10,
                    flexWrap: 'wrap',
                    alignItems:'center'
                  }}
                >
                  {item.options.map((_item, index) => (
                    <React.Fragment key={_item}>
                      <div
                      >
                        <Typography style={{ fontSize: 14 }}>{_item}</Typography>
                      </div>
                      {index < item.options.length - 1 && (
                        <Typography style={{ fontSize: 14 }}> | </Typography>
                      )}
                    </React.Fragment>
                  ))}
                  <IconButton onClick={()=>{handleEdit(item,index)}}>
                  <img src={editIcon} style={{ width: 16, height: 16 }} alt="edit" />
                  </IconButton>
                </div>
              </div>
            ))}
      </div>
      {show && (
        <ModalComponent
          open={true}
          header={{
            title: isEmpty(editData) ? 'Add Token' :'Edit Token',
            closeIconAction: closeAddModal,
          }}
        >
          <AddSoapNoteTokens 
            modalCloseAction={closeAddModal}
            defaultData={editData} 
            onSave={onSave}
          />

        </ModalComponent>
      )}
    </div>
  );
};

export default SoapNoteTokensList;
