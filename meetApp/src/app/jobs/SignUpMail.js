import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SignUpMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    console.log('Iniciando');
    const { user } = data;
    const { event } = data;
    const formattedDate = format(
      parseISO(event.date),
      "'dia' dd ' de ' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Agendamento cancelado',
      template: 'newsingup',
      context: {
        username: user.name,
        date: formattedDate,
      },
    });
  }
}

export default new SignUpMail();
