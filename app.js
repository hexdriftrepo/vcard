document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Dom Elements
    const btnSaveContact = document.getElementById('btn-save-contact');
    const btnShare = document.getElementById('btn-share');
    const btnQrcodeTrigger = document.getElementById('btn-qrcode-trigger');
    const qrcodeModal = document.getElementById('qrcode-modal');
    const modalClose = document.getElementById('modal-close');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Contact Data Configuration
    const contactData = {
        name: 'Navaneeth Venugopal',
        firstName: 'Navaneeth',
        lastName: 'Venugopal',
        phone: '8129110135',
        email: 'Navaneeth@hexdrift.com',
        title: 'Co-founder & CEO',
        company: 'Hexdrift',
        website: 'https://hexdrift.com'
    };

    // 1. Dynamic vCard (.vcf) Generator
    function generateVCard() {
        const vcardLines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${contactData.name}`,
            `N:${contactData.lastName};${contactData.firstName};;;`,
            `ORG:${contactData.company}`,
            `TITLE:${contactData.title}`,
            `TEL;TYPE=CELL,VOICE;VALUE=uri:tel:${contactData.phone}`,
            `EMAIL;TYPE=PREF,INTERNET:${contactData.email}`,
            `URL:${contactData.website}`,
            'REV:' + new Date().toISOString(),
            'END:VCARD'
        ];

        return vcardLines.join('\r\n');
    }

    function saveContact() {
        try {
            const vcardContent = generateVCard();
            const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
            
            // Standard dynamic download link anchor method
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `${contactData.name.replace(/\s+/g, '_')}.vcf`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Contact file downloaded! Import it to save.');
        } catch (error) {
            console.error('Error generating contact card:', error);
            showToast('Failed to generate contact card.');
        }
    }

    btnSaveContact.addEventListener('click', saveContact);

    // 2. Share functionality
    async function shareCard() {
        const shareTitle = `${contactData.name} | ${contactData.title}, ${contactData.company}`;
        const shareText = `Connect with ${contactData.name}, ${contactData.title} of ${contactData.company}. View contact page:`;
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                });
                showToast('Shared successfully!');
            } catch (error) {
                // If sharing was aborted/cancelled, don't show error toast, fallback to copy
                if (error.name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            // Fallback for browsers without native Web Share API
            copyToClipboard(shareUrl);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('Link copied to clipboard!');
            })
            .catch((err) => {
                console.error('Could not copy link: ', err);
                showToast('Failed to copy link.');
            });
    }

    btnShare.addEventListener('click', shareCard);

    // 3. QR Code Generator & Modal Logic
    let qrGenerated = false;

    function generateQRCode() {
        if (qrGenerated) return;
        
        const qrcodeContainer = document.getElementById('qrcode-container');
        qrcodeContainer.innerHTML = ''; // clear initial contents

        // Verify if QRCode library loaded correctly
        if (window.QRCode) {
            new window.QRCode(qrcodeContainer, {
                text: window.location.href,
                width: 160,
                height: 160,
                colorDark: '#0b0c16',
                colorLight: '#ffffff',
                correctLevel: window.QRCode.CorrectLevel.H
            });
            qrGenerated = true;
        } else {
            // Fallback placeholder/message if script fails to load
            qrcodeContainer.innerHTML = '<div style="color:#000;padding:20px;font-size:12px;">QR Code Generator unavailable offline</div>';
        }
    }

    function openModal() {
        generateQRCode();
        qrcodeModal.classList.add('active');
        qrcodeModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent page scrolling background
        modalClose.focus();
    }

    function closeModal() {
        qrcodeModal.classList.remove('active');
        qrcodeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // restore scrolling
        btnQrcodeTrigger.focus();
    }

    btnQrcodeTrigger.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    
    // Close modal when clicking outside contents (on overlay)
    qrcodeModal.addEventListener('click', (e) => {
        if (e.target === qrcodeModal) {
            closeModal();
        }
    });

    // Close modal on Escape press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qrcodeModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 4. Toast System
    let toastTimeout;
    function showToast(message) {
        // Clear active timer if present
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastMessage.textContent = message;
        toast.classList.add('active');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
});
