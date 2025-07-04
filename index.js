const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();
const qrcode = require('qrcode-terminal');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth()
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log('\n===== MENU =====');
    console.log('1. Send personalized messages');
    console.log('2. Exit');
    console.log('3. Logout WhatsApp');

    rl.question('Choose an option: ', async (answer) => {
        if (answer === '1') {
            await sendMessagesWithAnimation();
            showMenu();
        } else if (answer === '2') {
            console.log('Exiting...');
            rl.close();
            process.exit(0);
        } else if (answer === '3') {
            console.log('Logging out from WhatsApp...');
            await client.logout();
            console.log('✅ WhatsApp disconnected successfully.');
            rl.close();
            process.exit(0);
        } else {
            console.log('Invalid option.');
            showMenu();
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to join names in a natural way: ["A"] => "A", ["A", "B"] => "A e B"
function formatNames(names) {
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} e ${last}`;
}

async function sendMessagesWithAnimation() {
    const contacts = JSON.parse(fs.readFileSync('./contacts/contacts.json', 'utf-8'));
    const imagePath = path.join(__dirname, 'images', 'convite.jpeg');
    const media = MessageMedia.fromFilePath(imagePath);

    for (const contact of contacts) {
        const { number, names } = contact;
        const chatId = number + '@c.us';

        const isPlural = names.length > 1;1
        const formattedNames = formatNames([...names]); // Copy to avoid modifying the original

        const message = `${formattedNames}, é com muito carinho que convidamos ${isPlural ? 'vocês' : 'você'} para celebrar nossas Bodas de Prata, em uma pequena cerimônia. Devido à capacidade do local, este convite é individual e intransferível. Agradecemos a compreensão. Precisamos que confirme presença até dia 01/09 com a Joice no telefone ${process.env.CONTACT_PHONE}. Para se sentirem confortáveis os lugares serão marcados.`;

        try {
            await client.sendMessage(chatId, media, { caption: message });
            console.log(`✅ Message sent to: ${formattedNames} (${number})`);
        } catch (error) {
            console.error(`❌ Error sending message to ${formattedNames} (${number}):`, error.message);
        }

        await delay(2000); // 2 seconds delay
    }

    console.log('\n✅ All the messages have been sent.');
}

client.on('qr', (qr) => {
    console.log('Scan the QR Code below with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\nBot connected to WhatsApp!');
    showMenu();
});

client.initialize();
