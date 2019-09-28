import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    console.log('A fila executou');
    const { appointment } = data;
    const formattedDate = format(
      parseISO(appointment.date),
      "'dia' dd ' de ' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        client: appointment.user.name,
        date: formattedDate,
      },
    });
  }
}

export default new CancellationMail();
