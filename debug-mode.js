// Debug Mode Implementation


// Debug mode state
let debugMode = false;

// Function to generate sample data with different schemas, feedback states, and content
function generateSampleData() {
    return [
        {
            id: "sample1",
            schema: "Mesai",
            question: "Bu hafta mesai saatlerim neler?",
            conversation: [
                { role: "user", message: "Bu hafta mesai saatlerim neler?" },
                { role: "assistant", message: "Bu haftaki mesai saatleriniz şöyledir:\nPazartesi: 09:00 - 17:00\nSalı: 09:00 - 17:00\nÇarşamba: 10:00 - 18:00\nPerşembe: 09:00 - 17:00\nCuma: 09:00 - 16:00" }
            ],
            suggestions: ["mesai saatleri", "fazla mesai durumu", "izin talebi oluştur"],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_SCHEDULE]->(s:Schedule) WHERE s.week = '2023-W42' RETURN s",
                "MATCH (e:Employee {id: '12345'})-[:WORKED]->(h:Hours) WHERE h.date >= '2023-10-16' RETURN h"
            ],
            feedback: "positive",
            hidden: false,
            user: "kullanici1",
            datetime: "2023-10-20 14:32:45"
        },
        {
            id: "sample2",
            schema: "Mukavele",
            question: "Sözleşmemin bitiş tarihi ne zaman?",
            conversation: [
                { role: "user", message: "Sözleşmemin bitiş tarihi ne zaman?" },
                { role: "assistant", message: "Mevcut sözleşmeniz 31 Aralık 2023 tarihinde sona erecektir. Yenileme süreci hakkında bilgi almak ister misiniz?" }
            ],
            suggestions: ["sözleşme bitiş tarihi", "yenileme süreci", "sözleşme şartları"],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract) RETURN c.expiryDate",
                "MATCH (c:Contract)-[:HAS_TERMS]->(t:Terms) WHERE c.employeeId = '12345' RETURN t"
            ],
            feedback: "negative",
            hidden: false,
            user: "kullanici2",
            datetime: "2023-10-19 10:15:30"
        },
        {
            id: "sample3",
            schema: "Genel",
            question: "İzin talebinde nasıl bulunabilirim?",
            conversation: [
                { role: "user", message: "İzin talebinde nasıl bulunabilirim?" },
                { role: "assistant", message: "İzin talebinde bulunmak için:\n1. Çalışan portalına giriş yapın\n2. 'İzin Talepleri' bölümüne gidin\n3. 'Yeni İzin Talebi' butonuna tıklayın\n4. Tarih ve izin türünü seçin\n5. Onay için gönderin" }
            ],
            suggestions: ["izin talep formu", "izin hakkı sorgula", "izin takvimi"],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.vacationDays",
                "MATCH (p:Policy {type: 'vacation'})-[:APPLIES_TO]->(d:Department {id: '54321'}) RETURN p"
            ],
            feedback: null,
            hidden: true,
            user: "kullanici3",
            datetime: "2023-10-18 09:45:12"
        },
        {
            id: "sample4",
            schema: "Mukavele",
            question: "Sözleşme durumu sonlandı olan kaç tane künye var?",
            conversation: [
                { role: "user", message: "Sözleşme durumu sonlandı olan kaç tane künye var?" },
                { role: "assistant", message: "Sözleşme durumu \"sonlandı\" olan künye sayısını kontrol ediyorum. Sistem kayıtlarına göre toplam 127 adet sonlandırılmış sözleşme künyesi bulunmaktadır." }
            ],
            suggestions: ["sonlandırılan sözleşmeler", "son 3 ayda biten sözleşmeler", "yenilenmesi gereken sözleşmeler"],
            cypherQueries: [
                "MATCH (c:Contract) WHERE c.status = 'sonlandı' RETURN count(c)",
                "MATCH (c:Contract) WHERE c.status = 'sonlandı' AND c.terminationDate >= date() - duration('P3M') RETURN c"
            ],
            feedback: null,
            hidden: false,
            user: "kullanici4",
            datetime: "2023-10-17 11:20:15"
        },
        {
            id: "sample5",
            schema: "Mesai",
            question: "Kaç gün hastalık iznim kaldı?",
            conversation: [
                { role: "user", message: "Kaç gün hastalık iznim kaldı?" },
                { role: "assistant", message: "Bu yıl için 7 gün hastalık izniniz kalmıştır. Toplam 10 gün hakkınız vardı ve şimdiye kadar 3 gün kullandınız." },
                { role: "user", message: "Bu izinler ne zaman sona eriyor?" },
                { role: "assistant", message: "Hastalık izinleriniz takvim yılı sonunda, 31 Aralık 2023 tarihinde sona erecektir. Kullanılmayan izinler bir sonraki yıla devredilmez." }
            ],
            suggestions: ["hastalık izni talebi oluştur", "son izinlerimi göster", "izin politikası nedir"],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.sickDaysRemaining",
                "MATCH (e:Employee {id: '12345'})-[:REQUESTED]->(t:TimeOff {type: 'Sick'}) RETURN t ORDER BY t.date DESC"
            ],
            feedback: "positive",
            hidden: false,
            user: "kullanici5",
            datetime: "2023-10-16 09:05:22"
        },
        {
            id: "sample6",
            schema: "Mukavele",
            question: "Sözleşmemdeki avantajları görebilir miyim?",
            conversation: [
                { role: "user", message: "Sözleşmemdeki avantajları görebilir miyim?" },
                { role: "assistant", message: "Sözleşmeniz aşağıdaki avantajları içermektedir:\n- Sağlık sigortası (tıbbi masrafların %90'ını karşılar)\n- Diş sigortası (diş işlemlerinin %80'ini karşılar)\n- Göz sigortası (yıllık göz muayenesi ve gözlük/lens için 1500 TL)\n- Bireysel emeklilik katkısı (maaşın %5'ine kadar eşleşme)\n- 3 hafta ücretli izin\n- 10 gün hastalık izni\n- 5 gün kişisel izin\n- Spor salonu üyeliği geri ödemesi (ayda 500 TL'ye kadar)" }
            ],
            suggestions: ["sağlık sigortası detayları", "bireysel emeklilik katkısı", "spor salonu ödemesi nasıl yapılır"],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract)-[:INCLUDES]->(b:Benefits) RETURN b",
                "MATCH (i:Insurance {type: 'Health'})-[:COVERS]->(p:Procedure) RETURN p, p.coveragePercentage"
            ],
            feedback: "positive",
            hidden: false,
            user: "kullanici6",
            datetime: "2023-10-15 16:40:10"
        },
        {
            id: "sample7",
            schema: "Genel",
            question: "BT desteği ofis saatleri nedir?",
            conversation: [
                { role: "user", message: "BT desteği ofis saatleri nedir?" },
                { role: "assistant", message: "BT destek ekibi aşağıdaki saatlerde hizmet vermektedir:\nPazartesi-Cuma: 08:00 - 20:00\nCumartesi: 10:00 - 16:00\nPazar: Kapalı\n\nBu saatler dışındaki acil durumlar için dahili 5555 numaralı 7/24 destek hattını arayabilirsiniz." }
            ],
            suggestions: ["BT destek talebi oluştur", "acil BT desteği", "BT ekibi iletişim bilgileri"],
            cypherQueries: [
                "MATCH (d:Department {name: 'IT Support'})-[:HAS_HOURS]->(h:Hours) RETURN h",
                "MATCH (d:Department {name: 'IT Support'})-[:HAS_CONTACT]->(c:Contact) RETURN c"
            ],
            feedback: null,
            hidden: false,
            user: "kullanici7",
            datetime: "2023-10-14 13:25:33"
        },
        {
            id: "sample8",
            schema: "Mukavele",
            question: "Sözleşme durumu yürürlükte olan kaç tane sözleşme var?",
            conversation: [
                { role: "user", message: "Sözleşme durumu yürürlükte olan kaç tane sözleşme var?" },
                { role: "assistant", message: "Sözleşme durumu \"yürürlükte\" olan sözleşmelerin sayısını kontrol ediyorum. Sistem kayıtlarına göre şu anda toplam 243 adet yürürlükte olan sözleşme bulunmaktadır." }
            ],
            suggestions: ["yakında sona erecek sözleşmeler", "departmanlara göre sözleşmeler", "son 6 ayda imzalanan sözleşmeler"],
            cypherQueries: [
                "MATCH (c:Contract) WHERE c.status = 'yürürlükte' RETURN count(c)",
                "MATCH (c:Contract) WHERE c.status = 'yürürlükte' AND c.expiryDate <= date() + duration('P1M') RETURN c"
            ],
            feedback: "negative",
            hidden: false,
            user: "kullanici8",
            datetime: "2023-10-13 10:10:05"
        },
        {
            id: "sample9",
            schema: "Mesai",
            question: "Bu yılki resmi tatil günleri nelerdir?",
            conversation: [
                { role: "user", message: "Bu yılki resmi tatil günleri nelerdir?" },
                { role: "assistant", message: "Bu yılki resmi tatil günleri şunlardır:\n- Yılbaşı: 1 Ocak\n- Ulusal Egemenlik ve Çocuk Bayramı: 23 Nisan\n- Emek ve Dayanışma Günü: 1 Mayıs\n- Ramazan Bayramı: 21-23 Nisan\n- Gençlik ve Spor Bayramı: 19 Mayıs\n- Kurban Bayramı: 28 Haziran - 1 Temmuz\n- Demokrasi ve Milli Birlik Günü: 15 Temmuz\n- Zafer Bayramı: 30 Ağustos\n- Cumhuriyet Bayramı: 29 Ekim" }
            ],
            suggestions: ["gelecek yılın tatil takvimi", "hafta sonuna denk gelen tatiller", "tatil günleri izin talebi"],
            cypherQueries: [
                "MATCH (h:Holiday)-[:IN_YEAR]->(y:Year {year: 2023}) RETURN h ORDER BY h.date",
                "MATCH (h:Holiday)-[:IN_YEAR]->(y:Year {year: 2023}) WHERE h.date.dayOfWeek IN [6, 7] RETURN h"
            ],
            feedback: "positive",
            hidden: false,
            user: "kullanici9",
            datetime: "2023-10-12 15:55:40"
        },
        {
            id: "sample10",
            schema: "Mukavele",
            question: "2025 yılında sonlanacak sözleşmeleri gösterir misin?",
            conversation: [
                { role: "user", message: "2025 yılında sonlanacak sözleşmeleri gösterir misin?" },
                { role: "assistant", message: "2025 yılında sona erecek sözleşmeleri kontrol ediyorum. Sistemde 2025 yılında sona erecek toplam 45 sözleşme bulunmaktadır. Bunların listesini görüntülemek ister misiniz?" }
            ],
            suggestions: ["2025'te sonlanacak sözleşmelerin listesi", "yenileme planlaması", "sözleşme yürürlük tarihleri"],
            cypherQueries: [
                "MATCH (c:Contract) WHERE c.expiryDate >= date('2025-01-01') AND c.expiryDate <= date('2025-12-31') RETURN c",
                "MATCH (c:Contract) WHERE c.expiryDate >= date('2025-01-01') AND c.expiryDate <= date('2025-12-31') RETURN count(c)"
            ],
            feedback: null,
            hidden: true,
            user: "kullanici10",
            datetime: "2023-10-11 14:30:18"
        },
        {
            id: "sample11",
            schema: "Mukavele",
            question: "ABC Ltd. ile yapılan sözleşmeleri listeler misin?",
            conversation: [
                { role: "user", message: "ABC Ltd. ile yapılan sözleşmeleri listeler misin?" },
                { role: "assistant", message: "ABC Ltd. ile yapılan sözleşmeleri kontrol ediyorum. Sistemde ABC Ltd. ile yapılmış 12 adet sözleşme bulunmaktadır. İşte bu sözleşmelerin özeti:\n\n1. Hizmet Alım Sözleşmesi - 15/03/2022 (Yürürlükte)\n2. Gizlilik Sözleşmesi - 15/03/2022 (Yürürlükte)\n3. Yazılım Lisans Sözleşmesi - 01/06/2022 (Yürürlükte)\n4. Bakım Sözleşmesi - 01/07/2022 (Yürürlükte)\n5. Danışmanlık Hizmetleri - 15/10/2022 (Yürürlükte)\n6. Ek Protokol No.1 - 10/12/2022 (Yürürlükte)\n7. Veri İşleme Sözleşmesi - 01/01/2023 (Yürürlükte)\n8. Tedarik Sözleşmesi - 15/02/2023 (Sonlandı)\n9. Personel Kiralama - 01/04/2023 (Sonlandı)\n10. Ek Protokol No.2 - 15/05/2023 (Yürürlükte)\n11. Teknik Destek Sözleşmesi - 01/07/2023 (Yürürlükte)\n12. Eğitim Hizmetleri - 15/09/2023 (Yürürlükte)" }
            ],
            suggestions: ["ABC Ltd. son 6 aydaki sözleşmeler", "ABC Ltd. projeler", "ABC Ltd. yenileme tarihleri"],
            cypherQueries: [
                "MATCH (c:Contract)-[:WITH_COMPANY]->(comp:Company {name: 'ABC Ltd.'}) RETURN c ORDER BY c.startDate DESC",
                "MATCH (c:Contract)-[:WITH_COMPANY]->(comp:Company {name: 'ABC Ltd.'}) WHERE c.status = 'yürürlükte' RETURN count(c)"
            ],
            feedback: "positive",
            hidden: false,
            user: "kullanici11",
            datetime: "2023-10-10 11:15:22"
        },
        {
            id: "sample12",
            schema: "Mesai",
            question: "Geçen ayki fazla mesailerimi gösterir misin?",
            conversation: [
                { role: "user", message: "Geçen ayki fazla mesailerimi gösterir misin?" },
                { role: "assistant", message: "Geçen ay (Eylül 2023) yaptığınız fazla mesailer şu şekildedir:\n\n5 Eylül 2023: 2 saat\n12 Eylül 2023: 1.5 saat\n19 Eylül 2023: 3 saat\n26 Eylül 2023: 2 saat\n\nToplam: 8.5 saat fazla mesai" }
            ],
            suggestions: ["fazla mesai ödemeleri", "bu ayki planlanan mesailer", "fazla mesai talep formu"],
            cypherQueries: [
                "MATCH (e:Employee {id: '12345'})-[:WORKED]->(o:Overtime) WHERE o.date >= date('2023-09-01') AND o.date <= date('2023-09-30') RETURN o ORDER BY o.date",
                "MATCH (e:Employee {id: '12345'})-[:WORKED]->(o:Overtime) WHERE o.date >= date('2023-09-01') AND o.date <= date('2023-09-30') RETURN sum(o.hours)"
            ],
            feedback: null,
            hidden: false,
            user: "kullanici12",
            datetime: "2023-10-09 09:23:18"
        },
        {
            id: "sample13",
            schema: "Mukavele",
            question: "Son 30 günde imzalanan sözleşmeleri listeler misin?",
            conversation: [
                { role: "user", message: "Son 30 günde imzalanan sözleşmeleri listeler misin?" },
                { role: "assistant", message: "Son 30 günde imzalanan sözleşmeleri kontrol ediyorum. Son 30 gün içinde imzalanan 8 adet sözleşme bulunuyor:\n\n1. DEF A.Ş. - Hizmet Alım Sözleşmesi (26/09/2023)\n2. GHI Holding - Danışmanlık Sözleşmesi (28/09/2023)\n3. JKL Ltd. - Yazılım Lisans Anlaşması (02/10/2023)\n4. MNO A.Ş. - Gizlilik Sözleşmesi (05/10/2023)\n5. PQR Teknoloji - Bakım Anlaşması (09/10/2023)\n6. STU Sanayi - Tedarik Sözleşmesi (12/10/2023)\n7. VWX İnşaat - Proje Sözleşmesi (15/10/2023)\n8. YZ Elektrik - Hizmet Sözleşmesi (18/10/2023)" }
            ],
            suggestions: ["sözleşme detayları", "imza sürecindeki sözleşmeler", "sözleşme özet raporu"],
            cypherQueries: [
                "MATCH (c:Contract) WHERE c.signDate >= date() - duration('P30D') RETURN c ORDER BY c.signDate DESC",
                "MATCH (c:Contract) WHERE c.signDate >= date() - duration('P30D') RETURN count(c)"
            ],
            feedback: "positive",
            hidden: false,
            user: "kullanici13",
            datetime: "2023-10-08 16:45:30"
        },
        {
            id: "sample14",
            schema: "Genel",
            question: "Sistem ne zaman bakıma girecek?",
            conversation: [
                { role: "user", message: "Sistem ne zaman bakıma girecek?" },
                { role: "assistant", message: "Planlanan sistem bakımı bu hafta sonu, 22 Ekim 2023 Pazar günü saat 02:00 - 06:00 arasında gerçekleştirilecektir. Bu süre zarfında sistemin kullanılamayacağını ve tüm açık işlemlerin önceden kaydedilmesi gerektiğini hatırlatırız." }
            ],
            suggestions: ["bakım öncesi yapılması gerekenler", "bakım sırasında acil destek", "gelecek bakım tarihleri"],
            cypherQueries: [
                "MATCH (m:Maintenance) WHERE m.date > date() RETURN m ORDER BY m.date LIMIT 1",
                "MATCH (m:Maintenance) WHERE date(m.date) = date('2023-10-22') RETURN m"
            ],
            feedback: null,
            hidden: false,
            user: "kullanici14",
            datetime: "2023-10-07 10:35:12"
        },
        {
            id: "sample15",
            schema: "Mukavele",
            question: "23 numaralı müşterinin sözleşmelerini getir",
            conversation: [
                { role: "user", message: "23 numaralı müşterinin sözleşmelerini getir" },
                { role: "assistant", message: "23 numaralı müşteri (XYZ Teknoloji A.Ş.) ile ilgili sözleşmeleri kontrol ediyorum. Bu müşteri ile ilgili 5 sözleşme bulunmaktadır:\n\n1. Çerçeve Sözleşme #A-1023 (15/01/2022 - 15/01/2025)\n2. Yazılım Lisans Anlaşması #S-298 (01/02/2022 - 01/02/2024)\n3. Bakım ve Destek Sözleşmesi #M-76 (01/03/2022 - 01/03/2024)\n4. Ek Protokol #1 - API Entegrasyonu (15/07/2022 - 15/01/2025)\n5. Veri İşleme Sözleşmesi #D-42 (10/09/2022 - 15/01/2025)" }
            ],
            suggestions: ["23 numaralı müşteri detayları", "sözleşmelerin durumu", "yenileme tarihleri"],
            cypherQueries: [
                "MATCH (cl:Client {id:23})-[:CONTAINS]->(m:Matter)-[:HAS_CONTRACT]->(c:Contract) RETURN c.contractId, c.contractNumber, c.name",
                "MATCH (cl:Client {id:23})-[:CONTAINS]->(m:Matter)-[:HAS_CONTRACT]->(c:Contract) WHERE c.status = 'yürürlükte' RETURN count(c)"
            ],
            feedback: null,
            hidden: false,
            user: "kullanici15",
            datetime: "2023-10-06 13:20:45"
        }
    ];
}

// Function to initialize debug mode
function initializeDebugMode() {
    // Create debug control panel element
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '20px';
    debugPanel.style.right = '20px';
    debugPanel.style.backgroundColor = '#1f2937';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '8px';
    debugPanel.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    debugPanel.style.zIndex = '1000';
    debugPanel.style.display = 'flex';
    debugPanel.style.flexDirection = 'column';
    debugPanel.style.gap = '10px';

    // Create title
    const panelTitle = document.createElement('div');
    panelTitle.textContent = 'Debug Controls';
    panelTitle.style.fontWeight = 'bold';
    panelTitle.style.borderBottom = '1px solid #374151';
    panelTitle.style.paddingBottom = '5px';
    panelTitle.style.marginBottom = '5px';
    debugPanel.appendChild(panelTitle);

    // Create toggle switch container
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.justifyContent = 'space-between';
    toggleContainer.style.gap = '10px';

    // Create toggle label
    const toggleLabel = document.createElement('label');
    toggleLabel.textContent = 'Use Sample Data';
    toggleLabel.style.cursor = 'pointer';
    toggleContainer.appendChild(toggleLabel);

    // Create toggle switch
    const toggleSwitch = document.createElement('label');
    toggleSwitch.className = 'switch';
    toggleSwitch.style.position = 'relative';
    toggleSwitch.style.display = 'inline-block';
    toggleSwitch.style.width = '50px';
    toggleSwitch.style.height = '24px';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'debug-toggle';
    toggleInput.checked = debugMode;
    toggleInput.style.opacity = '0';
    toggleInput.style.width = '0';
    toggleInput.style.height = '0';

    const toggleSlider = document.createElement('span');
    toggleSlider.style.position = 'absolute';
    toggleSlider.style.cursor = 'pointer';
    toggleSlider.style.top = '0';
    toggleSlider.style.left = '0';
    toggleSlider.style.right = '0';
    toggleSlider.style.bottom = '0';
    toggleSlider.style.backgroundColor = '#4b5563';
    toggleSlider.style.transition = '.4s';
    toggleSlider.style.borderRadius = '24px';

    // Create toggle button
    const toggleButton = document.createElement('span');
    toggleButton.style.position = 'absolute';
    toggleButton.style.content = '""';
    toggleButton.style.height = '18px';
    toggleButton.style.width = '18px';
    toggleButton.style.left = '3px';
    toggleButton.style.bottom = '3px';
    toggleButton.style.backgroundColor = 'white';
    toggleButton.style.transition = '.4s';
    toggleButton.style.borderRadius = '50%';
    toggleSlider.appendChild(toggleButton);

    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleSlider);
    toggleContainer.appendChild(toggleSwitch);
    debugPanel.appendChild(toggleContainer);

    // Create data count display
    const dataCountDisplay = document.createElement('div');
    dataCountDisplay.id = 'debug-data-count';
    dataCountDisplay.textContent = 'No sample data loaded';
    dataCountDisplay.style.fontSize = '0.8rem';
    dataCountDisplay.style.color = '#9ca3af';
    debugPanel.appendChild(dataCountDisplay);

    // Create show/hide button
    const hideButton = document.createElement('button');
    hideButton.textContent = 'Hide Panel';
    hideButton.style.padding = '5px 10px';
    hideButton.style.backgroundColor = '#374151';
    hideButton.style.border = 'none';
    hideButton.style.borderRadius = '4px';
    hideButton.style.color = 'white';
    hideButton.style.cursor = 'pointer';
    hideButton.style.fontSize = '0.8rem';
    hideButton.style.transition = 'background-color 0.2s';
    hideButton.style.marginTop = '5px';
    hideButton.addEventListener('mouseover', () => {
        hideButton.style.backgroundColor = '#4b5563';
    });
    hideButton.addEventListener('mouseout', () => {
        hideButton.style.backgroundColor = '#374151';
    });
    debugPanel.appendChild(hideButton);

    // Add panel to document
    document.body.appendChild(debugPanel);

    // Create show button (initially hidden)
    const showButton = document.createElement('button');
    showButton.id = 'debug-show-btn';
    showButton.textContent = 'Debug';
    showButton.style.position = 'fixed';
    showButton.style.bottom = '20px';
    showButton.style.right = '20px';
    showButton.style.backgroundColor = '#2563eb';
    showButton.style.color = 'white';
    showButton.style.padding = '5px 10px';
    showButton.style.borderRadius = '4px';
    showButton.style.border = 'none';
    showButton.style.cursor = 'pointer';
    showButton.style.display = 'none';
    showButton.style.zIndex = '1000';
    document.body.appendChild(showButton);

    // Add event listeners
    toggleInput.addEventListener('change', function() {
        debugMode = this.checked;

        if (debugMode) {
            // Visual indicator that debug mode is active
            document.documentElement.style.setProperty('--debug-border', '4px solid #2563eb');
            document.body.style.border = 'var(--debug-border)';

            // Update status in debug panel
            dataCountDisplay.textContent = 'Sample data enabled';
            dataCountDisplay.style.color = '#10b981';

            // Load sample data
            const sampleData = generateSampleData();
            data = sampleData;
            filteredData = [...data.filter(item => !item.hidden)];

            // Update the display
            currentPage = 0;
            totalPages = 1;
            initializeTabs(totalPages);
            dataCountDisplay.textContent = `${sampleData.length} sample records loaded`;
            renderItems();

            // Update connection status indicator
            const connectionIndicator = document.getElementById('connection-indicator');
            const connectionText = document.getElementById('connection-text');

            if (connectionIndicator) {
                connectionIndicator.classList.remove('disconnected');
                connectionIndicator.classList.add('connected');
            }

            if (connectionText) {
                connectionText.textContent = 'DEBUG MODE: Using sample data';
            }
        } else {
            // Remove visual debug indicator
            document.body.style.border = 'none';

            // Update status in debug panel
            dataCountDisplay.textContent = 'Using real data connection';
            dataCountDisplay.style.color = '#9ca3af';

            // Reconnect to real data
            connectToMongoDB();
        }
    });

    // Hide/Show panel toggle
    hideButton.addEventListener('click', function() {
        debugPanel.style.display = 'none';
        showButton.style.display = 'block';
    });

    showButton.addEventListener('click', function() {
        debugPanel.style.display = 'flex';
        showButton.style.display = 'none';
    });

    // Add CSS for toggle switch
    const style = document.createElement('style');
    style.textContent = `
    .switch input:checked + span {
      background-color: #2563eb;
    }
    
    .switch input:checked + span span {
      transform: translateX(26px);
    }
    
    .switch input:focus + span {
      box-shadow: 0 0 1px #2563eb;
    }
    
    :root {
      --debug-border: none;
    }
  `;
    document.head.appendChild(style);
}

// Modified connectToMongoDB function that uses sample data when in debug mode
async function connectToMongoDB(page = 0) {
    // If debug mode is active, use sample data instead of real API call
    if (debugMode) {
        console.log("DEBUG MODE: Using sample data instead of MongoDB connection");

        // Get sample data
        const sampleData = generateSampleData();

        // Simulate loading delay for realistic testing
        const connectionIndicator = document.getElementById('connection-indicator');
        const connectionText = document.getElementById('connection-text');

        if (connectionIndicator) {
            connectionIndicator.classList.remove('connected');
            connectionIndicator.classList.remove('disconnected');
        }

        if (connectionText) {
            connectionText.textContent = 'DEBUG MODE: Loading sample data...';
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update connection status
        if (connectionIndicator) {
            connectionIndicator.classList.add('connected');
        }

        if (connectionText) {
            connectionText.textContent = `DEBUG MODE: ${sampleData.length} sample records loaded`;
        }

        // Set data and pagination
        data = sampleData;
        filteredData = [...data.filter(item => !item.hidden)];
        currentPage = 0;
        totalPages = 1;

        // Initialize UI
        initializeTabs(totalPages);
        renderItems();

        return;
    }

    // Original connectToMongoDB function for real data
    try {
        // Show connecting status
        connectionIndicator.classList.remove('connected');
        connectionIndicator.classList.remove('disconnected');
        connectionText.textContent = `Connecting to MongoDB (page ${page + 1})...`;

        // Clear existing data
        data = [];
        filteredData = [];

        // Fetch data from our backend API with pagination
        const response = await fetch(`${API_BASE_URL}/conversations?page=${page}&limit=${pageSize}`);

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API response:", result);

        let mongoData;
        if (result.data) {
            mongoData = result.data;

            // Update pagination info
            currentPage = result.pagination.page;
            totalPages = result.pagination.totalPages;
        } else {
            // Handle old API format
            mongoData = result;
            currentPage = 0;
            totalPages = 1;
        }

        // Update connection status
        connectionIndicator.classList.add('connected');
        connectionText.textContent = `Connected to MongoDB - ${mongoData.length} records loaded`;

        if (result.pagination) {
            connectionText.textContent += ` (Page ${currentPage + 1} of ${totalPages} - Total: ${result.pagination.totalCount})`;
        }

        // Convert and store data
        data = convertMongoDataToAppFormat(mongoData);
        console.log("Converted data:", data);

        filteredData = [...data.filter(item => !item.hidden)];

        // Initialize tabs
        initializeTabs(totalPages);

        // Render items
        renderItems();

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        connectionIndicator.classList.add('disconnected');
        connectionText.textContent = 'Failed to connect to MongoDB: ' + error.message;

        // For development/testing - offer to switch to debug mode
        if (confirm('Connection to API failed. Switch to debug mode with sample data?')) {
            // Enable debug mode
            debugMode = true;

            // Update the toggle if it exists
            const debugToggle = document.getElementById('debug-toggle');
            if (debugToggle) {
                debugToggle.checked = true;
            }

            // Load sample data
            const sampleData = generateSampleData();
            data = sampleData;
            filteredData = [...data.filter(item => !item.hidden)];

            // Update the display
            currentPage = 0;
            totalPages = 1;
            initializeTabs(totalPages);

            // Update connection status
            connectionIndicator.classList.remove('disconnected');
            connectionIndicator.classList.add('connected');
            connectionText.textContent = `DEBUG MODE: ${sampleData.length} sample records loaded`;

            // Add visual indicator that debug mode is active
            document.documentElement.style.setProperty('--debug-border', '4px solid #2563eb');
            document.body.style.border = 'var(--debug-border)';

            // Render the items
            renderItems();
        }
    }
}

// Add the initializeDebugMode() function call to the document load event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize debug panel
    initializeDebugMode();
});

// Update the mock API functions to respect debug mode
// This allows testing schema changes, feedback, etc. without a real backend

// Modified setSchema function with debug mode support
async function setSchema(id, schema) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // Update schema locally first
    const oldSchema = item.schema;
    item.schema = schema;

    // Update schema buttons in this item
    const itemElement = document.querySelector(`.feedback-item[data-id="${id}"]`);
    if (itemElement) {
        const schemaButtons = itemElement.querySelectorAll('.schema-btn');
        schemaButtons.forEach(button => {
            const buttonSchema = button.dataset.schema;
            button.classList.toggle('active', buttonSchema === schema);
        });
    }

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Schema for item ${id} updated to "${schema}"`);

        // Apply filters to update UI if needed
        if (activeSchema) {
            applyFilters();
        }
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/schema`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schema })
        });

        if (!response.ok) {
            console.error('Error updating schema:', await response.text());
            // Revert to old schema if update failed
            item.schema = oldSchema;
            if (itemElement) {
                const schemaButtons = itemElement.querySelectorAll('.schema-btn');
                schemaButtons.forEach(button => {
                    const buttonSchema = button.dataset.schema;
                    button.classList.toggle('active', buttonSchema === oldSchema);
                });
            }
            alert('Failed to update schema on server. Please try again.');
            return;
        }

        // Apply filters to update UI if needed
        if (activeSchema) {
            applyFilters();
        }
    } catch (error) {
        console.error('Failed to update schema:', error);
        // Revert to old schema if update failed
        item.schema = oldSchema;
        if (itemElement) {
            const schemaButtons = itemElement.querySelectorAll('.schema-btn');
            schemaButtons.forEach(button => {
                const buttonSchema = button.dataset.schema;
                button.classList.toggle('active', buttonSchema === oldSchema);
            });
        }
        alert('Failed to update schema: ' + error.message);
    }
}

// Modified handlePositiveFeedback function with debug mode support
async function handlePositiveFeedback(id) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // If already positive, remove feedback
    const newFeedback = item.feedback === 'positive' ? null : 'positive';

    // Update data locally first
    data = data.map(item => {
        if (item.id === id) {
            return { ...item, feedback: newFeedback };
        }
        return item;
    });

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Feedback for item ${id} updated to "${newFeedback}"`);
        applyFilters();
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/feedback`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback: newFeedback })
        });

        if (!response.ok) {
            console.error('Error updating feedback:', await response.text());
        }
    } catch (error) {
        console.error('Failed to update feedback:', error);
    }

    // Apply filters to update UI
    applyFilters();
}

// Modified handleNegativeFeedback function with debug mode support
async function handleNegativeFeedback(id) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // If already negative, remove feedback
    const newFeedback = item.feedback === 'negative' ? null : 'negative';

    // Update data locally first
    data = data.map(item => {
        if (item.id === id) {
            return { ...item, feedback: newFeedback };
        }
        return item;
    });

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Feedback for item ${id} updated to "${newFeedback}"`);
        applyFilters();
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/feedback`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feedback: newFeedback })
        });

        if (!response.ok) {
            console.error('Error updating feedback:', await response.text());
        }
    } catch (error) {
        console.error('Failed to update feedback:', error);
    }

    // Apply filters to update UI
    applyFilters();
}

// Modified handleToggleHidden function with debug mode support
async function handleToggleHidden(id) {
    const item = data.find(item => item.id === id);
    if (!item) return;

    // Toggle hidden state
    const newHiddenState = !item.hidden;

    // Update data locally first
    data = data.map(item => {
        if (item.id === id) {
            return { ...item, hidden: newHiddenState };
        }
        return item;
    });

    // If in debug mode, just simulate success
    if (debugMode) {
        console.log(`DEBUG MODE: Hidden state for item ${id} updated to "${newHiddenState}"`);
        applyFilters();
        return;
    }

    // Update MongoDB via API when not in debug mode
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/archive`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hidden: newHiddenState })
        });

        if (!response.ok) {
            console.error('Error updating archive status:', await response.text());
        }
    } catch (error) {
        console.error('Failed to update archive status:', error);
    }

    // Apply filters to update UI
    applyFilters();
}