// Debug Mode Implementation


// Debug mode state
let debugMode = false;

// Function to generate sample data with different schemas, feedback states, and content
// Function to generate sample data with the new structure
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
            datetime: "2023-10-20 14:32:45",
            // New fields
            agentHistoryFilteredData: "[{_id=67f7ed72d93f8208ba752ea3, conversationId=1c352b10-82f7-4e71-a654-59e73e5746dd, uuid=50704a08-1626-11f0-ae95-0242ac150002, userName=kullanici1, timestamp=1744301426, RDate=Thu Apr 10 19:10:26 TRT 2025, messages=[{role=user, content=Bu hafta mesai saatlerim neler?}, {role=assistant, content=Bu haftaki mesai saatleriniz şöyledir:\\nPazartesi: 09:00 - 17:00\\nSalı: 09:00 - 17:00\\nÇarşamba: 10:00 - 18:00\\nPerşembe: 09:00 - 17:00\\nCuma: 09:00 - 16:00}], type=scheduler}]",
            contract_ids: "[\"CT-001\", \"CT-002\", \"CT-003\"]",
            document_ids: "[\"DOC-123\", \"DOC-456\"]",
            entitySuggesterData: "[{text: \"mesai saatleri\"}, {text: \"fazla mesai durumu\"}, {text: \"izin talebi oluştur\"}]",
            sql_query: "MATCH (e:Employee {id: '12345'})-[:HAS_SCHEDULE]->(s:Schedule) WHERE s.week = '2023-W42' RETURN s"
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
            datetime: "2023-10-19 10:15:30",
            // New fields with partial data
            agentHistoryFilteredData: "[]",
            contract_ids: "[\"CT-004\", \"CT-005\"]",
            document_ids: "[]",
            entitySuggesterData: "[{text: \"sözleşme bitiş tarihi\"}, {text: \"yenileme süreci\"}, {text: \"sözleşme şartları\"}]",
            sql_query: "MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract) RETURN c.expiryDate"
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
            datetime: "2023-10-18 09:45:12",
            // New fields
            agentHistoryFilteredData: "[{_id=67f7ed72d93f8208ba752ea5, conversationId=1c352b10-82f7-4e71-a654-59e73e574634, uuid=50704a08-1626-11f0-ae95-0242ac150042, userName=kullanici3, timestamp=1744301426, RDate=Thu Apr 10 19:10:26 TRT 2025, messages=[{role=user, content=İzin talebinde nasıl bulunabilirim?}, {role=assistant, content=İzin talebinde bulunmak için:\\n1. Çalışan portalına giriş yapın\\n2. 'İzin Talepleri' bölümüne gidin\\n3. 'Yeni İzin Talebi' butonuna tıklayın\\n4. Tarih ve izin türünü seçin\\n5. Onay için gönderin}], type=leave-request}]",
            contract_ids: "[]",
            document_ids: "[\"DOC-789\"]",
            entitySuggesterData: "[{text: \"izin talep formu\"}, {text: \"izin hakkı sorgula\"}, {text: \"izin takvimi\"}]",
            sql_query: "MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.vacationDays"
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
            datetime: "2023-10-17 11:20:15",
            // New fields
            agentHistoryFilteredData: "[]",
            contract_ids: "[]",
            document_ids: "[]",
            entitySuggesterData: "[]",
            sql_query: "MATCH (c:Contract) WHERE c.status = 'sonlandı' RETURN count(c)"
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
            datetime: "2023-10-16 09:05:22",
            // New fields with complex sample
            agentHistoryFilteredData: "[{_id=67f7ed72d93f8208ba752ea5, conversationId=1c352b10-82f7-4e71-a654-59e73e574612, uuid=50704a08-1626-11f0-ae95-0242ac150056, userName=kullanici5, timestamp=1744301426, RDate=Thu Apr 10 19:10:26 TRT 2025, messages=[{role=user, content=Kaç gün hastalık iznim kaldı?}, {role=assistant, content=Bu yıl için 7 gün hastalık izniniz kalmıştır. Toplam 10 gün hakkınız vardı ve şimdiye kadar 3 gün kullandınız.}, {role=user, content=Bu izinler ne zaman sona eriyor?}, {role=assistant, content=Hastalık izinleriniz takvim yılı sonunda, 31 Aralık 2023 tarihinde sona erecektir. Kullanılmayan izinler bir sonraki yıla devredilmez.}], type=sick-leave}]",
            contract_ids: "[\"CT-006\", \"CT-007\", \"CT-008\", \"CT-009\"]",
            document_ids: "[\"DOC-321\", \"DOC-654\", \"DOC-987\"]",
            entitySuggesterData: "[{text: \"hastalık izni talebi oluştur\"}, {text: \"son izinlerimi göster\"}, {text: \"izin politikası nedir\"}]",
            sql_query: "MATCH (e:Employee {id: '12345'})-[:HAS_BENEFITS]->(b:Benefits) RETURN b.sickDaysRemaining"
        },
        // Add more sample items if needed, following the same pattern
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
            datetime: "2023-10-15 16:40:10",
            // New fields with real-looking data format from your paste sample
            agentHistoryFilteredData: "[{_id=67f7ed72d93f8208ba752ef6, conversationId=1c352b10-82f7-4e71-a654-59e73e574690, uuid=50704a08-1626-11f0-ae95-0242ac150076, userName=kullanici6, timestamp=1744301426, RDate=Thu Apr 10 19:10:26 TRT 2025, messages=[{role=user, content=Sözleşmemdeki avantajları görebilir miyim?}, {role=assistant, content=Sözleşmeniz aşağıdaki avantajları içermektedir:\\n- Sağlık sigortası (tıbbi masrafların %90'ını karşılar)\\n- Diş sigortası (diş işlemlerinin %80'ini karşılar)\\n- Göz sigortası (yıllık göz muayenesi ve gözlük/lens için 1500 TL)\\n- Bireysel emeklilik katkısı (maaşın %5'ine kadar eşleşme)\\n- 3 hafta ücretli izin\\n- 10 gün hastalık izni\\n- 5 gün kişisel izin\\n- Spor salonu üyeliği geri ödemesi (ayda 500 TL'ye kadar)}], type=contract-benefits}]",
            contract_ids: "[\"CT-010\"]",
            document_ids: "[\"DOC-444\"]",
            entitySuggesterData: "[{text: \"sağlık sigortası detayları\"}, {text: \"bireysel emeklilik katkısı\"}, {text: \"spor salonu ödemesi nasıl yapılır\"}]",
            sql_query: "MATCH (e:Employee {id: '12345'})-[:HAS_CONTRACT]->(c:Contract)-[:INCLUDES]->(b:Benefits) RETURN b"
        },
        {
            id: "sample7",
            schema: "Genel",
            question: "Veri bulunamadı örneği",
            conversation: [
                { role: "user", message: "Veri bulunamadı örneği" },
                { role: "assistant", message: "Veri bulunamadı." }
            ],
            suggestions: [],
            cypherQueries: [],
            feedback: null,
            hidden: false,
            user: "kullanici7",
            datetime: "2023-10-14 13:25:33",
            // Empty fields to test disabled buttons
            agentHistoryFilteredData: "[]",
            contract_ids: "[]",
            document_ids: "[]",
            entitySuggesterData: "[]",
            sql_query: ""
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
            datetime: "2023-10-13 10:10:05",
            // New fields
            agentHistoryFilteredData: "[{_id=67f7ed72d93f8208ba752e88, conversationId=1c352b10-82f7-4e71-a654-59e73e574622, uuid=50704a08-1626-11f0-ae95-0242ac150085, userName=kullanici8, timestamp=1744301426, RDate=Thu Apr 10 19:10:26 TRT 2025, messages=[{role=user, content=Sözleşme durumu yürürlükte olan kaç tane sözleşme var?}, {role=assistant, content=Sözleşme durumu \"yürürlükte\" olan sözleşmelerin sayısını kontrol ediyorum. Sistem kayıtlarına göre şu anda toplam 243 adet yürürlükte olan sözleşme bulunmaktadır.}], type=contract-count}]",
            contract_ids: "[\"CT-011\", \"CT-012\", \"CT-013\", \"CT-014\", \"CT-015\"]",
            document_ids: "[\"DOC-111\", \"DOC-222\", \"DOC-333\"]",
            entitySuggesterData: "[{text: \"yakında sona erecek sözleşmeler\"}, {text: \"departmanlara göre sözleşmeler\"}, {text: \"son 6 ayda imzalanan sözleşmeler\"}]",
            sql_query: "MATCH (c:Contract) WHERE c.status = 'yürürlükte' RETURN count(c)"
        },
        {
            _id: {"$oid": "67f81929b2f94f5f67a26c4b"},
            RDate: {"$date": "2025-04-10T19:16:57.390Z"},
            agentHistoryFilteredData: "[{_id=67f81aeab2f94f5f67a26c4f, conversationId=d2513ed9-4f30-48c5-979f-ec2f1f800ae9, uuid=6a54a30e-1641-11f0-b0d8-f6cafc3fedbf, userName=icucak, timestamp=1744313066, RDate=Thu Apr 10 22:24:26 TRT 2025, messages=[{role=user, content=Mukavele sisteminden örnek getirebilir misin}, {role=assistant, content=}, {role=user, content=Oluşturduğunuz Cypher sorgusu hatalıydı. Hatayı düzeltip tekrar aynı formatta cevabı ver. Şu hatayı aldım:Maksimum yeniden deneme sayısına ulaşıldı (3). Son hata: Cannot run an empty query}, {role=assistant, content=MATCH (cl:Client {id:1718})-[:CONTAINS]->(m:Matter {rsId:'0df19089-3951-4e2b-be14-db3b9a90651c'})-[:HAS_CONTRACT]->(c:Contract)\nRETURN c.contractId, c.contractNumber, c.name}], type=cypher-generator, groupId=66c7e1ba-1641-11f0-b0d8-f6cafc3fedbf, botVersion=v2}]",
            contract_ids: "[]",
            conversationId: "d2513ed9-4f30-48c5-979f-ec2f1f800ae9",
            document_ids: "[]",
            entitySuggesterData: "[{_id=67f81ae6b2f94f5f67a26c4d, conversationId=d2513ed9-4f30-48c5-979f-ec2f1f800ae9, userMessage=Mukavele sisteminden örnek getirebilir misin, suggestion=null, response=null, cheet=null, RDate=Thu Apr 10 22:24:22 TRT 2025}]",
            messages: "[{role=user, content=EPC ile EPCM arasındaki farklar nelerdir?}, {role=assistant, content=Bu konuda detaylı bir bilgi veremem, ancak EPC (Mühendislik, Tedarik ve İnşaat) ile EPCM (Mühendislik, Tedarik, İnşaat Yönetimi) arasındaki farklar genellikle proje sahipliğindeki sorumluluk ve yönetim şekliyle ilgilidir. EPC, yüklenicinin tüm projeyi üstlendiği bir modeli ifade ederken, EPCM modelinde mühendislik ve yönetim hizmetleri sağlanır ancak proje sahibi daha fazla kontrol ve sorumluluğa sahiptir. Proje yönetimi veya belge yönetim sistemi konularında yardımcı olabilirim.}, {role=user, content=Mukavele sisteminden örnek getirebilir misin}, {role=assistant, content=\n<body>\n    <h3>Mukavele Örnekleri</h3>\n    <table border=\"1\" cellpadding=\"5\" cellspacing=\"0\">\n        <thead>\n            <tr>\n                <th>Sözleşme Numarası</th>\n                <th>Sözleşme Adı</th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr>\n                <td>SASA513</td>\n                <td>Cips Silo Soğutucu Satın Alım Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA2948</td>\n                <td>Satın Alma Siparişi</td>\n            </tr>\n            <tr>\n                <td>SASA3041</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3039</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA2997</td>\n                <td>Sipariş Formu</td>\n            </tr>\n            <tr>\n                <td>SASA3122</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA2947</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3140</td>\n                <td>Çarter Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3070</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3156</td>\n                <td>Sipariş Formu</td>\n            </tr>\n            <tr>\n                <td>SASA3121</td>\n                <td>Satın Alma Siparişi</td>\n            </tr>\n            <tr>\n                <td>SASA3019</td>\n                <td>Bakım Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3081</td>\n                <td>Satın Alma Siparişi</td>\n            </tr>\n            <tr>\n                <td>SASA3118</td>\n                <td>Veri Yok</td>\n            </tr>\n            <tr>\n                <td>SASA2932</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3109</td>\n                <td>Gizlilik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3071</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA2998</td>\n                <td>Sipariş Formu</td>\n            </tr>\n            <tr>\n                <td>SASA3092</td>\n                <td>Satın Alma Sipariş Formu</td>\n            </tr>\n            <tr>\n                <td>SASA2933</td>\n                <td>Satın Alma Siparişi</td>\n            </tr>\n            <tr>\n                <td>SASA3139</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3022</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3144</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3084</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA2971</td>\n                <td>Veri Yok</td>\n            </tr>\n            <tr>\n                <td>SASA3163</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n            <tr>\n                <td>SASA3075</td>\n                <td>Veri Yok</td>\n            </tr>\n            <tr>\n                <td>SASA3080</td>\n                <td>Confidentiality and Limited Use Agreement</td>\n            </tr>\n            <tr>\n                <td>SASA3030</td>\n                <td>Veri Yok</td>\n            </tr>\n            <tr>\n                <td>SASA3056</td>\n                <td>Tedarik Sözleşmesi</td>\n            </tr>\n        </tbody>\n    </table>\n</body>}]",
            sql_query: null,
            timestamp: 1744312617,
            userName: "icucak",
            uuid: "5261ea50-1640-11f0-b0d8-f6cafc3fedbf"
        },
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

        // Preprocess the data to add button enablement flags
        sampleData.forEach(item => {
            // Add flags for whether buttons should be enabled
            item.hasAgentHistoryData = item.agentHistoryFilteredData &&
                item.agentHistoryFilteredData !== "[]" &&
                item.agentHistoryFilteredData.length > 2;

            item.hasContractIds = item.contract_ids &&
                item.contract_ids !== "[]" &&
                item.contract_ids.length > 2;

            item.hasDocumentIds = item.document_ids &&
                item.document_ids !== "[]" &&
                item.document_ids.length > 2;

            item.hasEntitySuggesterData = item.entitySuggesterData &&
                item.entitySuggesterData !== "[]" &&
                item.entitySuggesterData.length > 2;
        });

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

// Add this function to your debug module
function addDebugControls() {
    const debugPanel = document.getElementById('debug-panel');
    if (!debugPanel) return;

    // Add a debug log button
    const logButton = document.createElement('button');
    logButton.textContent = 'Log Current Data';
    logButton.style.marginTop = '10px';
    logButton.addEventListener('click', () => {
        console.log("Current data:", data);
        console.log("Filtered data:", filteredData);
    });

    debugPanel.appendChild(logButton);

    // Add a parse test button
    const parseTestButton = document.createElement('button');
    parseTestButton.textContent = 'Test Parse Sample';
    parseTestButton.style.marginTop = '5px';
    parseTestButton.addEventListener('click', () => {
        // Create a test sample based on your real data
        const testSample = {
            _id: {"$oid": "67f81929b2f94f5f67a26c4b"},
            RDate: {"$date": "2025-04-10T19:16:57.390Z"},
            agentHistoryFilteredData: "[{_id=67f81aeab2f94f5f67a26c4f, conversationId=d2513ed9-4f30-48c5-979f-ec2f1f800ae9, uuid=6a54a30e-1641-11f0-b0d8-f6cafc3fedbf, userName=icucak, timestamp=1744313066, messages=[{role=user, content=Test message}]}]",
            contract_ids: "[]",
            conversationId: "d2513ed9-4f30-48c5-979f-ec2f1f800ae9",
            document_ids: "[]",
            entitySuggesterData: "[]",
            messages: "[{role=user, content=Test message}, {role=assistant, content=Test response}]",
            sql_query: null,
            timestamp: 1744312617,
            userName: "testuser",
            uuid: "5261ea50-1640-11f0-b0d8-f6cafc3fedbf"
        };

        // Try to parse it
        const parsedItems = convertMongoDataToAppFormat([testSample]);
        console.log("Parse test result:", parsedItems);
    });

    debugPanel.appendChild(parseTestButton);
}
// Patch the convertMongoDataToAppFormat function to be more robust
// Enhanced debugging for MongoDB data parsing
(function() {
    console.log("Debug mode activated for MongoDB data parsing");

    // Create a debug panel to see raw data
    function createDebugPanel() {
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 300px; height: 400px; background: #1e1e1e; color: #00ff00; padding: 10px; overflow: auto; z-index: 9999; font-family: monospace; font-size: 12px; border: 1px solid #333; resize: both;';
        debugPanel.innerHTML = '<h3>Debug Panel</h3><button id="debug-close" style="position:absolute;top:5px;right:5px;">×</button><div id="debug-content"></div>';
        document.body.appendChild(debugPanel);

        document.getElementById('debug-close').addEventListener('click', () => {
            debugPanel.style.display = 'none';
        });

        return debugPanel;
    }

    // Create a toggle button
    const debugToggle = document.createElement('button');
    debugToggle.textContent = 'Debug';
    debugToggle.style.cssText = 'position: fixed; bottom: 10px; right: 10px; z-index: 10000; background: #333; color: #fff; border: none; padding: 5px 10px; cursor: pointer;';
    document.body.appendChild(debugToggle);

    let debugPanel;
    debugToggle.addEventListener('click', () => {
        if (!debugPanel) {
            debugPanel = createDebugPanel();
        } else {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        }
    });

    // Override fetch to capture MongoDB data
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch(...args);

        // Clone the response so we can read it multiple times
        const clone = response.clone();

        try {
            // Only process API responses
            if (args[0].includes('/api/conversations')) {
                const data = await clone.json();

                // Log to console
                console.log('MongoDB API Response:', data);

                // Add to debug panel if it exists
                if (debugPanel && debugPanel.style.display !== 'none') {
                    const debugContent = document.getElementById('debug-content');

                    // Create a collapsible section
                    const section = document.createElement('div');
                    section.innerHTML = `
            <p style="margin: 5px 0; cursor: pointer; border-bottom: 1px solid #444; padding-bottom: 3px;">
              ${new Date().toLocaleTimeString()} - ${args[0].split('?')[0]}
              <span style="float: right">▼</span>
            </p>
            <pre style="display: none; max-height: 200px; overflow: auto; background: #252525; padding: 5px; margin: 0 0 10px 0;">${JSON.stringify(data, null, 2)}</pre>
          `;

                    // Toggle collapse
                    section.querySelector('p').addEventListener('click', (e) => {
                        const pre = section.querySelector('pre');
                        pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
                        e.target.querySelector('span').textContent = pre.style.display === 'none' ? '▼' : '▲';
                    });

                    debugContent.prepend(section);
                }
            }
        } catch (e) {
            console.error('Error processing debug data:', e);
        }

        // Return original response
        return response;
    };

    // Enhanced message parsing function
    window.debugParseMessages = function(messagesStr) {
        if (!messagesStr) return null;

        console.log('Attempting to parse messages:', messagesStr.substring(0, 100) + '...');

        // Try multiple parsing methods and show which one worked
        let result = null;
        let method = 'none';

        try {
            // Method 1: Direct JSON parse
            try {
                result = JSON.parse(messagesStr);
                method = 'direct-json';
            } catch (e) {
                // Method 2: Clean and parse
                const cleaned = messagesStr
                    .replace(/'/g, '"')
                    .replace(/(\w+)=/g, '"$1":');

                try {
                    result = JSON.parse(cleaned);
                    method = 'cleaned-json';
                } catch (e2) {
                    // Method 3: Regex extraction
                    const matches = messagesStr.match(/\{role=(.*?), content=(.*?)(?=\}, \{|\}$)/gs);
                    if (matches) {
                        result = matches.map(m => {
                            const roleMatch = m.match(/role=([^,]+)/);
                            const contentMatch = m.match(/content=(.+)/s);
                            return {
                                role: roleMatch ? roleMatch[1].trim() : 'unknown',
                                content: contentMatch ? contentMatch[1].trim() : ''
                            };
                        });
                        method = 'regex';
                    }
                }
            }
        } catch (e) {
            console.error('All parsing methods failed:', e);
        }

        console.log(`Parsing complete using method: ${method}`, result);
        return { result, method };
    };

    // Replace the original parseMessages function
    const originalParseMessages = window.parseMessages;
    window.parseMessages = function(messagesStr) {
        try {
            console.log('Parsing messages with robustified function');

            // Handle non-string input
            if (!messagesStr) return [
                { role: 'user', message: 'No messages available' }
            ];

            if (typeof messagesStr !== 'string') {
                console.warn('Messages is not a string type:', typeof messagesStr);
                return [
                    { role: 'user', message: 'Message in non-string format' }
                ];
            }

            // Case 1: Try parsing as JSON directly
            try {
                const parsed = JSON.parse(messagesStr);
                console.log('Successfully parsed as direct JSON');

                if (Array.isArray(parsed)) {
                    return parsed.map(msg => ({
                        role: msg.role || 'unknown',
                        message: msg.content || msg.message || 'No content'
                    }));
                }
            } catch (e) {
                console.log('Direct JSON parse failed, trying other methods');
            }

            // Case 2: It might be a Python-style dictionary string
            const cleaned = messagesStr
                .replace(/'/g, '"')
                .replace(/(\w+)=/g, '"$1":')
                .replace(/None/g, 'null')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false');

            try {
                const parsed = JSON.parse(cleaned);
                console.log('Successfully parsed as cleaned JSON');

                if (Array.isArray(parsed)) {
                    return parsed.map(msg => ({
                        role: msg.role || 'unknown',
                        message: msg.content || msg.message || 'No content'
                    }));
                }
            } catch (e) {
                console.log('Cleaned JSON parse failed, trying regex');
            }

            // Case 3: Extract with regex
            const messages = [];

            // Match each role=XXX, content=YYY pattern
            const regex = /\{role=([^,]+), content=([^}]+)\}/g;
            let match;

            while ((match = regex.exec(messagesStr)) !== null) {
                messages.push({
                    role: match[1].trim(),
                    message: match[2].trim().replace(/^['"]|['"]$/g, '')
                });
            }

            if (messages.length > 0) {
                console.log('Successfully extracted messages with regex');
                return messages;
            }

            // Case 4: Try more aggressive regex
            const roleContentPairs = messagesStr.match(/role=(.*?)(?:,|$).*?content=(.*?)(?:,\s*\w+=|\}|$)/gs);

            if (roleContentPairs && roleContentPairs.length > 0) {
                const extractedMessages = [];

                for (const pair of roleContentPairs) {
                    const roleMatch = pair.match(/role=([^,}]+)/);
                    const contentMatch = pair.match(/content=([^,}]+)/);

                    if (roleMatch && contentMatch) {
                        extractedMessages.push({
                            role: roleMatch[1].trim().replace(/^['"]|['"]$/g, ''),
                            message: contentMatch[1].trim().replace(/^['"]|['"]$/g, '')
                        });
                    }
                }

                if (extractedMessages.length > 0) {
                    console.log('Successfully extracted with aggressive regex');
                    return extractedMessages;
                }
            }

            console.warn('All parsing methods failed, returning default message');
            return [
                { role: 'user', message: 'Failed to parse messages' },
                { role: 'assistant', message: 'The message format could not be parsed' }
            ];

        } catch (e) {
            console.error('Critical error in parseMessages:', e);
            return [
                { role: 'user', message: 'Error parsing messages' },
                { role: 'assistant', message: 'An error occurred while parsing the conversation' }
            ];
        }
    };

    // Add fix for rendering Markdown content
    window.renderFormattedContent = function(content) {
        // If the content is not a string, convert it
        if (typeof content !== 'string') {
            content = String(content || '');
        }

        // Replace markdown code blocks with HTML
        content = content.replace(/```(\w*)\n([\s\S]*?)\n```/g,
            '<pre><code class="language-$1">$2</code></pre>');

        // Replace inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Replace markdown links
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Replace newlines with <br>
        content = content.replace(/\n/g, '<br>');

        return content;
    };

    console.log("MongoDB data parsing debug helpers installed");
})();
(function() {
    const originalConvert = window.convertMongoDataToAppFormat;

    window.convertMongoDataToAppFormat = function(mongoData) {
        console.log('Converting MongoDB data with patched function');

        if (!mongoData || !Array.isArray(mongoData)) {
            console.error('Invalid MongoDB data structure:', mongoData);
            return [];
        }

        return mongoData.map(item => {
            try {
                // Handle messages in various formats
                let parsedMessages = [];

                if (item.messages) {
                    try {
                        parsedMessages = parseMessages(item.messages);
                    } catch (e) {
                        console.error('Error parsing messages:', e);
                        parsedMessages = [
                            { role: 'user', message: 'Error parsing conversation' }
                        ];
                    }
                }

                // Get first user message more reliably
                let question = 'No question found';
                try {
                    if (parsedMessages.length > 0) {
                        const userMsg = parsedMessages.find(m => m.role === 'user');
                        if (userMsg) question = userMsg.message;
                    }
                } catch (e) {
                    console.error('Error extracting question:', e);
                }

                // Process suggestions more safely
                let suggestions = [];
                try {
                    if (item.entitySuggesterData) {
                        if (typeof item.entitySuggesterData === 'string') {
                            try {
                                // Try direct JSON parse
                                const parsed = JSON.parse(item.entitySuggesterData);
                                if (Array.isArray(parsed)) {
                                    suggestions = parsed.filter(Boolean).map(s =>
                                        typeof s === 'string' ? s :
                                            s.suggestion || s.text || JSON.stringify(s)
                                    );
                                }
                            } catch (e) {
                                // Try extracting with regex
                                const matches = item.entitySuggesterData.match(/(suggestion|text)=([^,}]+)/g);
                                if (matches) {
                                    suggestions = matches.map(m => {
                                        const value = m.split('=')[1].trim();
                                        return value.replace(/^['"]|['"]$/g, '');
                                    }).filter(Boolean);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error processing suggestions:', e);
                }

                // Handle cypher queries better
                let cypherQueries = [];
                if (item.sql_query) {
                    if (typeof item.sql_query === 'string') {
                        cypherQueries = [item.sql_query];
                    } else if (Array.isArray(item.sql_query)) {
                        cypherQueries = item.sql_query;
                    }
                }

                // Safely extract ID
                const id = item._id?.$oid ||
                    (typeof item._id === 'string' ? item._id : null) ||
                    item.id ||
                    item.uuid ||
                    `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

                // Better timestamp extraction
                let timestamp = null;
                if (item.timestamp) {
                    timestamp = typeof item.timestamp === 'number' ?
                        item.timestamp : parseInt(String(item.timestamp));
                } else if (item.RDate && item.RDate.$date) {
                    timestamp = new Date(item.RDate.$date).getTime();
                } else if (item._id && item._id.$oid) {
                    // Get timestamp from MongoDB ObjectId
                    const objectIdTimestamp = parseInt(item._id.$oid.substring(0, 8), 16) * 1000;
                    timestamp = objectIdTimestamp;
                }

                if (!timestamp || isNaN(timestamp)) {
                    timestamp = Date.now();
                }

                const date = new Date(timestamp);
                const formattedDate = isNaN(date.getTime()) ?
                    'Invalid date' :
                    date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

                return {
                    id: id,
                    schema: item.schema || '',
                    question: question,
                    conversation: parsedMessages,
                    suggestions: suggestions,
                    cypherQueries: cypherQueries,
                    feedback: item.feedback || null,
                    hidden: !!item.hidden,
                    user: item.userName || item.user || 'Unknown',
                    datetime: formattedDate,
                    timestamp: timestamp,

                    // Add additional data
                    agentHistoryFilteredData: item.agentHistoryFilteredData || "[]",
                    contractIds: item.contract_ids || "[]",
                    documentIds: item.document_ids || "[]",
                    entitySuggesterData: item.entitySuggesterData || "[]",

                    // Add flags for button enabling
                    hasAgentHistoryData: !!item.agentHistoryFilteredData &&
                        item.agentHistoryFilteredData !== "[]" &&
                        item.agentHistoryFilteredData.length > 5,
                    hasContractIds: !!item.contract_ids &&
                        item.contract_ids !== "[]" &&
                        item.contract_ids.length > 5,
                    hasDocumentIds: !!item.document_ids &&
                        item.document_ids !== "[]" &&
                        item.document_ids.length > 5,
                    hasEntitySuggesterData: !!item.entitySuggesterData &&
                        item.entitySuggesterData !== "[]" &&
                        item.entitySuggesterData.length > 5
                };
            } catch (itemError) {
                console.error('Error converting item:', itemError, item);
                return null;
            }
        }).filter(Boolean); // Remove null items
    };

    console.log('Data conversion function patched');
})();