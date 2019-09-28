import * as yup from 'yup';

class AppointmentValidation {
  validateAppointment() {
    const schema = yup.object().shape({
      provider_id: yup.number().required(),
      date: yup.date().required(),
    });

    return schema;
  }
}
export default new AppointmentValidation();
