import Registration from '../models/Registration.js';

export const generateRegistrationCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `REG-${year}`;
  
  const lastReg = await Registration.findOne({ registrationCode: new RegExp(`^${prefix}`) })
    .sort({ registrationCode: -1 })
    .limit(1);
  
  let sequence = 1;
  if (lastReg) {
    const lastSequence = parseInt(lastReg.registrationCode.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(5, '0')}`;
};

export const generateTicketNumber = async () => {
  const prefix = 'TKT';
  
  const lastReg = await Registration.findOne({ ticketNumber: new RegExp(`^${prefix}`) })
    .sort({ ticketNumber: -1 })
    .limit(1);
  
  let sequence = 1;
  if (lastReg) {
    const lastSequence = parseInt(lastReg.ticketNumber.replace(prefix, ''));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(6, '0')}`;
};