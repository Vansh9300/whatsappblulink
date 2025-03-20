const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server);

// Function to cleanup session files
const cleanupSession = async () => {
    try {
        const sessionPath = path.join(__dirname, '.wwebjs_auth');
        if (require('fs').existsSync(sessionPath)) {
            await require('fs/promises').rm(sessionPath, { recursive: true, force: true });
            console.log('Old session files cleaned up');
        }
    } catch (error) {
        console.error('Error cleaning up session:', error);
    }
};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    server.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            server.listen(port + 1, '0.0.0.0');
        } else {
            console.error('Server error:', err);
        }
    });
} else {
    module.exports = app;
}

// Maps to track user states
const greetedUsers = new Map();
const userStates = new Map(); // Track which menu the user is in

// Create a new WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR Code for WhatsApp Web authentication
client.on('qr', (qr) => {
    console.log('QR Code received');
    io.emit('qr', qr);
});

// Handle client ready event
client.on('ready', () => {
    console.log('Client is ready!');
    io.emit('ready');
});

// Handle incoming messages
client.on('message', async (message) => {
    // Define greeting patterns
    const greetingPatterns = ['hi', 'hello', 'hey', 'hola', 'greetings','hii'];
    const messageText = message.body.toLowerCase();
    
    // Check if the message is a greeting
    const isGreeting = greetingPatterns.some(pattern => messageText.includes(pattern));
    
    // Marketing template response
    const marketingReply = 'Thank you for selecting Blulink Marketing: The best digital agency in the country🩵✨\n\nPlease choose the service you want to skyrocket your business🚀\n\n1.) Website Development\n2.) Application Development\n3.) Wordpress Development\n4.) Shopify Development\n5.) Game Development\n6.) Digital Marketing\n7.) Online Branding\n8.) 3d/ VR/ Other services\n\n✅Please select and reply with the corresponding number to select a service.✅';

    // Website Development service options
    // Update all service reply messages to include back option
    const backOption = '\n\n0.) Press 0 to go back to main menu';
    const websiteDevReply = 'Thank you for choosing "Website Development"\n\nWe have developed one of the best websites for our clients ranging from simple portfolio websites to fully functional E-commerce platforms or aggregator platforms.\n\nBefore we proceed, please select one of the following to give us a better understanding of your project:\n\n1.) Frontend Development\n2.) Backend Development\n3.) Fullstack Development\n4.) I have some other requirements' + backOption;
    
    const appDevReply = 'Thank you for choosing "Application Development"\n\nWe specialize in creating cutting-edge applications that transform businesses and enhance user experiences.\n\nPlease select your preferred application type:\n\n1.) Mobile App Development (iOS/Android)\n2.) Desktop Application Development\n3.) Cross-platform Application\n4.) Enterprise Solutions\n5.) Custom Application Requirements' + backOption;
    
    const wordpressDevReply = 'Thank you for choosing "WordPress Development"\n\nWe are experts in creating professional WordPress websites tailored to your needs.\n\nPlease select your preferred WordPress service:\n\n1.) Custom WordPress Theme Development\n2.) WordPress Plugin Development\n3.) WordPress E-commerce (WooCommerce)\n4.) WordPress Migration & Optimization\n5.) WordPress Maintenance & Support' + backOption;
    
    const shopifyDevReply = 'Thank you for choosing "Shopify Development"\n\nWe create stunning and high-converting Shopify stores that drive sales and growth.\n\nPlease select your preferred Shopify service:\n\n1.) Custom Shopify Store Development\n2.) Shopify Theme Customization\n3.) Shopify App Integration\n4.) Shopify Migration Services\n5.) Shopify SEO & Marketing' + backOption;
    
    const gameDevReply = 'Thank you for choosing "Game Development"\n\nWe create engaging and immersive gaming experiences across multiple platforms.\n\nPlease select your game development needs:\n\n1.) Mobile Game Development\n2.) PC Game Development\n3.) Unity Game Development\n4.) Unreal Engine Development\n5.) HTML5 Game Development' + backOption;
    
    const digitalMarketingReply = 'Thank you for choosing "Digital Marketing"\n\nWe help businesses grow their online presence and reach their target audience effectively.\n\nPlease select your marketing focus:\n\n1.) Search Engine Optimization (SEO)\n2.) Social Media Marketing\n3.) Pay-Per-Click (PPC) Advertising\n4.) Content Marketing\n5.) Email Marketing' + backOption;
    
    const onlineBrandingReply = 'Thank you for choosing "Online Branding"\n\nWe help establish and enhance your brand digital presence and identity.\n\nPlease select your branding needs:\n\n1.) Brand Identity Design\n2.) Social Media Branding\n3.) Brand Strategy Development\n4.) Brand Voice & Messaging\n5.) Visual Content Creation' + backOption;
    
    const otherServicesReply = 'Thank you for choosing "3D/VR/Other Services"\n\nWe specialize in cutting-edge immersive technologies and custom solutions.\n\nPlease select your area of interest:\n\n1.) 3D Modeling & Animation\n2.) Virtual Reality (VR) Development\n3.) Augmented Reality (AR) Solutions\n4.) Mixed Reality Applications\n5.) Custom Technology Solutions' + backOption;
    
    try {
        const userId = message.from;
        const thankYouReply = 'Thank you for choosing Blulink Marketing! Our executives will contact you shortly, till then, you can visit our website www.blulinkmarketing.com to know about us more!';

        if (messageText === '1' && !isGreeting && !userStates.get(userId)) {
            // Send website development options from main menu
            await message.reply(websiteDevReply);
            userStates.set(userId, 'website_dev_menu');
        } else if (messageText === '2' && !isGreeting && !userStates.get(userId)) {
            // Send application development options from main menu
            await message.reply(appDevReply);
            userStates.set(userId, 'app_dev_menu');
        } else if (messageText === '3' && !isGreeting && !userStates.get(userId)) {
            // Send WordPress development options from main menu
            await message.reply(wordpressDevReply);
            userStates.set(userId, 'wordpress_dev_menu');
        } else if (messageText === '4' && !isGreeting && !userStates.get(userId)) {
            // Send Shopify development options from main menu
            await message.reply(shopifyDevReply);
            userStates.set(userId, 'shopify_dev_menu');
        } else if (messageText === '5' && !isGreeting && !userStates.get(userId)) {
            // Send Game development options from main menu
            await message.reply(gameDevReply);
            userStates.set(userId, 'game_dev_menu');
        } else if (messageText === '6' && !isGreeting && !userStates.get(userId)) {
            // Send Digital Marketing options from main menu
            await message.reply(digitalMarketingReply);
            userStates.set(userId, 'digital_marketing_menu');
        } else if (messageText === '7' && !isGreeting && !userStates.get(userId)) {
            // Send Online Branding options from main menu
            await message.reply(onlineBrandingReply);
            userStates.set(userId, 'online_branding_menu');
        } else if (messageText === '8' && !isGreeting && !userStates.get(userId)) {
            // Send 3D/VR/Other services options from main menu
            await message.reply(otherServicesReply);
            userStates.set(userId, 'other_services_menu');
        } else if (messageText === '1' && userStates.get(userId) === 'website_dev_menu') {
            // Handle selection '1' in website development menu
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (isGreeting && !greetedUsers.has(userId)) {
            // Send marketing template for first-time greetings
            await message.reply(marketingReply);
            greetedUsers.set(userId, true);
            userStates.delete(userId); // Reset user state for new greeting
        } else if (userStates.get(userId) === 'website_dev_menu' && ['1', '2', '3', '4'].includes(messageText)) {
            // Handle website development menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'app_dev_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle application development menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'wordpress_dev_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle WordPress development menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'shopify_dev_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle Shopify development menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'game_dev_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle Game development menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'digital_marketing_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle Digital Marketing menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'online_branding_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle Online Branding menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (userStates.get(userId) === 'other_services_menu' && ['1', '2', '3', '4', '5'].includes(messageText)) {
            // Handle 3D/VR/Other services menu selections
            await message.reply(thankYouReply);
            userStates.delete(userId); // Reset user state after selection
        } else if (!isGreeting) {
            // Default response for non-greeting messages
            if (messageText === '0' && userStates.get(userId)) {
                // Handle back to main menu
                await message.reply(marketingReply);
                userStates.delete(userId); // Reset user state
            } else if (userStates.get(userId)) {
                await message.reply('Please select a valid option or press 0 to go back to main menu.');
            }
        }
        const logMessage = 'Auto-reply sent successfully!';
console.log(logMessage);
io.emit('console', logMessage);
    } catch (error) {
        const errorMessage = `Error sending auto-reply: ${error}`;
console.error(errorMessage);
io.emit('console', errorMessage);
    }
});

// Cleanup and initialize
cleanupSession().then(() => {
    client.initialize().catch(err => {
        console.error('Failed to initialize client:', err);
        process.exit(1);
    });
});

// Handle process termination
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Cleaning up...');
    try {
        await client.destroy();
        await cleanupSession();
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
});