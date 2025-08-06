class MetapromptGenerator {
    constructor() {
        this.xmlData = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const form = document.getElementById('generatedForm');
        const exportBtn = document.getElementById('exportBtn');

        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        uploadZone.addEventListener('click', () => fileInput.click());

       form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePrompt();
        });

        exportBtn.addEventListener('click', () => this.exportJSON());
    }

    async handleFileSelect(file) {
        if (!file || !file.name.endsWith('.xml')) {
            alert('Veuillez sélectionner un fichier XML valide.');
            return;
        }

        try {
            const xmlText = await this.readFile(file);
            this.parseXML(xmlText);
            this.displayMetadata();
            this.generateForm();
        } catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            alert('Erreur lors du traitement du fichier XML.');
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    parseXML(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('XML invalide');
        }

        this.xmlData = {
            metadata: this.extractMetadata(xmlDoc),
            promptTemplate: this.extractPromptTemplate(xmlDoc),
            variables: this.extractVariables(xmlDoc),
            uiConfig: this.extractUIConfig(xmlDoc)
        };
    }

    extractMetadata(xmlDoc) {
        const metadata = xmlDoc.querySelector('metadata');
        return {
            name: metadata.querySelector('name')?.textContent || '',
            description: metadata.querySelector('description')?.textContent || '',
            version: metadata.querySelector('version')?.textContent || '',
            tags: Array.from(metadata.querySelectorAll('tag')).map(tag => tag.textContent)
        };
    }

    extractPromptTemplate(xmlDoc) {
        const templateElement = xmlDoc.querySelector('prompt_template');
        return templateElement ? templateElement.textContent.trim() : '';
    }

    extractVariables(xmlDoc) {
        const variables = {};
        const variableElements = xmlDoc.querySelectorAll('variable');

        variableElements.forEach(varElement => {
            const name = varElement.getAttribute('name');
            const required = varElement.getAttribute('required') === 'true';
            
            const variable = {
                name,
                required,
                type: varElement.querySelector('type')?.textContent || 'text',
                label: varElement.querySelector('label')?.textContent || name,
                placeholder: varElement.querySelector('placeholder')?.textContent || '',
                default: varElement.querySelector('default')?.textContent || '',
                min: varElement.querySelector('min')?.textContent || '',
                max: varElement.querySelector('max')?.textContent || '',
                step: varElement.querySelector('step')?.textContent || '',
                options: [],
                labels: {}
            };

            // Extract options
            const optionElements = varElement.querySelectorAll('option');
            optionElements.forEach(option => {
                variable.options.push({
                    value: option.getAttribute('value') || option.textContent,
                    label: option.textContent
                });
            });

            // Extract labels for range slider
            const labelElements = varElement.querySelectorAll('labels label');
            labelElements.forEach(label => {
                const value = label.getAttribute('value');
                variable.labels[value] = label.textContent;
            });

            // Extract validation
            const validation = varElement.querySelector('validation');
            if (validation) {
                variable.validation = {
                    minLength: validation.querySelector('min_length')?.textContent || '',
                    maxLength: validation.querySelector('max_length')?.textContent || ''
                };
            }

            variables[name] = variable;
        });

        return variables;
    }

    extractUIConfig(xmlDoc) {
        const uiConfig = xmlDoc.querySelector('ui_configuration');
        if (!uiConfig) return null;

        const config = {
            theme: uiConfig.querySelector('theme')?.textContent || 'default',
            layout: uiConfig.querySelector('layout')?.textContent || 'vertical',
            sections: []
        };

        const sectionElements = uiConfig.querySelectorAll('section');
        sectionElements.forEach(section => {
            config.sections.push({
                name: section.getAttribute('name'),
                order: parseInt(section.getAttribute('order')) || 0,
                collapsible: section.getAttribute('collapsible') === 'true',
                fields: section.querySelector('fields')?.textContent.split(',').map(f => f.trim()) || []
            });
        });

        return config;
    }

    displayMetadata() {
        const metadataSection = document.getElementById('metadataSection');
        const titleElement = document.getElementById('promptTitle');
        const descriptionElement = document.getElementById('promptDescription');
        const tagsElement = document.getElementById('promptTags');

        titleElement.textContent = this.xmlData.metadata.name;
        descriptionElement.textContent = this.xmlData.metadata.description;
        
        tagsElement.innerHTML = '';
        this.xmlData.metadata.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsElement.appendChild(tagElement);
        });

        metadataSection.style.display = 'block';
        metadataSection.classList.add('fade-in');
    }

    generateForm() {
        const formContainer = document.getElementById('formContainer');
        const formSection = document.getElementById('formSection');
        
        formContainer.innerHTML = '';

        if (this.xmlData.uiConfig && this.xmlData.uiConfig.sections.length > 0) {
            this.generateSectionedForm(formContainer);
        } else {
            this.generateSimpleForm(formContainer);
        }

        formSection.style.display = 'block';
        formSection.classList.add('fade-in');
    }

    generateSectionedForm(container) {
        const sections = this.xmlData.uiConfig.sections.sort((a, b) => a.order - b.order);
        
        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = `form-section-group ${section.collapsible ? 'collapsible' : ''}`;
            
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = section.name;
            
            if (section.collapsible) {
                sectionTitle.addEventListener('click', () => {
                    sectionDiv.classList.toggle('collapsed');
                });
            }
            
            const sectionContent = document.createElement('div');
            sectionContent.className = 'form-section-content';
            
            section.fields.forEach(fieldName => {
                if (this.xmlData.variables[fieldName]) {
                    const fieldElement = this.createFormField(this.xmlData.variables[fieldName]);
                    sectionContent.appendChild(fieldElement);
                }
            });
            
            sectionDiv.appendChild(sectionTitle);
            sectionDiv.appendChild(sectionContent);
            container.appendChild(sectionDiv);
        });
    }

    generateSimpleForm(container) {
        Object.values(this.xmlData.variables).forEach(variable => {
            const fieldElement = this.createFormField(variable);
            container.appendChild(fieldElement);
        });
    }

    createFormField(variable) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = variable.label + (variable.required ? ' *' : '');
        label.setAttribute('for', variable.name);

        let inputElement;

        switch (variable.type) {
            case 'text':
                inputElement = this.createTextInput(variable);
                break;
            case 'number':
                inputElement = this.createNumberInput(variable);
                break;
            case 'textarea':
                inputElement = this.createTextarea(variable);
                break;
            case 'select':
                inputElement = this.createSelect(variable);
                break;
            case 'checkbox':
                return this.createCheckbox(variable);
            case 'checkbox_group':
                return this.createCheckboxGroup(variable);
            case 'range':
                inputElement = this.createRange(variable);
                break;
            case 'radio':
                return this.createRadioGroup(variable);
            default:
                inputElement = this.createTextInput(variable);
        }

        formGroup.appendChild(label);
        formGroup.appendChild(inputElement);

        return formGroup;
    }

    createTextInput(variable) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = variable.name;
        input.name = variable.name;
        input.placeholder = variable.placeholder;
        input.required = variable.required;
        if (variable.default) input.value = variable.default;
        
        if (variable.validation) {
            if (variable.validation.minLength) input.minLength = variable.validation.minLength;
            if (variable.validation.maxLength) input.maxLength = variable.validation.maxLength;
        }

        return input;
    }

    createNumberInput(variable) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = variable.name;
        input.name = variable.name;
        input.required = variable.required;
        if (variable.default) input.value = variable.default;
        if (variable.min) input.min = variable.min;
        if (variable.max) input.max = variable.max;
        if (variable.step) input.step = variable.step;

        return input;
    }

    createTextarea(variable) {
        const textarea = document.createElement('textarea');
        textarea.id = variable.name;
        textarea.name = variable.name;
        textarea.placeholder = variable.placeholder;
        textarea.required = variable.required;
        if (variable.default) textarea.value = variable.default;

        return textarea;
    }

    createSelect(variable) {
        const select = document.createElement('select');
        select.id = variable.name;
        select.name = variable.name;
        select.required = variable.required;

        if (!variable.required) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Sélectionnez une option';
            select.appendChild(defaultOption);
        }

        variable.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (option.value === variable.default) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        return select;
    }

    createCheckbox(variable) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = variable.name;
        input.name = variable.name;
        input.checked = variable.default === 'true';

        const label = document.createElement('label');
        label.setAttribute('for', variable.name);
        label.textContent = variable.label;

        checkboxItem.appendChild(input);
        checkboxItem.appendChild(label);
        formGroup.appendChild(checkboxItem);

        return formGroup;
    }

    createCheckboxGroup(variable) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = variable.label + (variable.required ? ' *' : '');

        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';

        let defaultValues = [];
        if (variable.default) {
            try {
                defaultValues = JSON.parse(variable.default);
            } catch (e) {
                defaultValues = [];
            }
        }

        variable.options.forEach(option => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${variable.name}_${option.value}`;
            input.name = variable.name;
            input.value = option.value;
            input.checked = defaultValues.includes(option.value);

            const itemLabel = document.createElement('label');
            itemLabel.setAttribute('for', `${variable.name}_${option.value}`);
            itemLabel.textContent = option.label;

            checkboxItem.appendChild(input);
            checkboxItem.appendChild(itemLabel);
            checkboxGroup.appendChild(checkboxItem);
        });

        formGroup.appendChild(label);
        formGroup.appendChild(checkboxGroup);

        return formGroup;
    }

    createRange(variable) {
        const container = document.createElement('div');
        container.className = 'range-container';

        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'range-slider';
        input.id = variable.name;
        input.name = variable.name;
        input.min = variable.min || 0;
        input.max = variable.max || 100;
        input.value = variable.default || variable.min || 0;

        const valueDisplay = document.createElement('div');
        valueDisplay.textContent = `Valeur: ${input.value}`;
        valueDisplay.style.textAlign = 'center';
        valueDisplay.style.fontWeight = 'bold';

        input.addEventListener('input', () => {
            valueDisplay.textContent = `Valeur: ${input.value}`;
        });

        container.appendChild(input);
        container.appendChild(valueDisplay);

        // Add labels if available
        if (Object.keys(variable.labels).length > 0) {
            const labelsDiv = document.createElement('div');
            labelsDiv.className = 'range-labels';
            
            const sortedLabels = Object.entries(variable.labels).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
            sortedLabels.forEach(([value, label]) => {
                const labelSpan = document.createElement('span');
                labelSpan.textContent = label;
                labelsDiv.appendChild(labelSpan);
            });
            
            container.appendChild(labelsDiv);
        }

        return container;
    }

    createRadioGroup(variable) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = variable.label + (variable.required ? ' *' : '');

        const radioGroup = document.createElement('div');
        radioGroup.className = 'checkbox-group'; // Réutilise le style des checkbox

        variable.options.forEach(option => {
            const radioItem = document.createElement('div');
            radioItem.className = 'checkbox-item';

            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `${variable.name}_${option.value}`;
            input.name = variable.name;
            input.value = option.value;
            input.required = variable.required;
            if (option.value === variable.default) {
                input.checked = true;
            }

            const itemLabel = document.createElement('label');
            itemLabel.setAttribute('for', `${variable.name}_${option.value}`);
            itemLabel.textContent = option.label;

            radioItem.appendChild(input);
            radioItem.appendChild(itemLabel);
            radioGroup.appendChild(radioItem);
        });

        formGroup.appendChild(label);
        formGroup.appendChild(radioGroup);

        return formGroup;
    }

    generatePrompt() {
        const formData = this.getFormData();
        const compiledPrompt = this.compilePrompt(formData);
        
        this.displayResult(compiledPrompt, formData);
    }

    getFormData() {
        const formData = {};
        const form = document.getElementById('generatedForm');
        const formDataObject = new FormData(form);

        // Handle regular form fields
        for (let [key, value] of formDataObject.entries()) {
            if (formData[key]) {
                // Handle multiple values (checkboxes)
                if (Array.isArray(formData[key])) {
                    formData[key].push(value);
                } else {
                    formData[key] = [formData[key], value];
                }
            } else {
                formData[key] = value;
            }
        }

        // Handle checkbox groups specifically
        Object.keys(this.xmlData.variables).forEach(varName => {
            const variable = this.xmlData.variables[varName];
            if (variable.type === 'checkbox_group') {
                const checkboxes = form.querySelectorAll(`input[name="${varName}"]:checked`);
                formData[varName] = Array.from(checkboxes).map(cb => cb.value);
            } else if (variable.type === 'checkbox') {
                const checkbox = form.querySelector(`input[name="${varName}"]`);
                formData[varName] = checkbox ? checkbox.checked : false;
            }
        });

        return formData;
    }

    compilePrompt(formData) {
        let prompt = this.xmlData.promptTemplate;

        // Simple template engine (remplace {{variable}} et gère les conditionnels)
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            const regex = new RegExp(`{{${key}}}`, 'g');
            
            if (Array.isArray(value)) {
                prompt = prompt.replace(regex, value.join(', '));
            } else if (typeof value === 'boolean') {
                prompt = prompt.replace(regex, value ? 'Oui' : 'Non');
            } else {
                prompt = prompt.replace(regex, value || '');
            }
        });

        // Handle conditional blocks {{#variable}}...{{/variable}}
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
            
            if (value && value !== '' && value !== false && (!Array.isArray(value) || value.length > 0)) {
                prompt = prompt.replace(conditionalRegex, '$1');
            } else {
                prompt = prompt.replace(conditionalRegex, '');
            }
        });

        // Clean up any remaining template syntax
        prompt = prompt.replace(/{{[^}]*}}/g, '');
        prompt = prompt.replace(/\n\s*\n/g, '\n\n'); // Remove extra empty lines
        
        return prompt.trim();
    }

    displayResult(prompt, formData) {
        const resultSection = document.getElementById('resultSection');
        const promptResult = document.getElementById('promptResult');
        const jsonResult = document.getElementById('jsonResult');

        promptResult.textContent = prompt;
        jsonResult.textContent = JSON.stringify({
            metadata: this.xmlData.metadata,
            formData: formData,
            generatedPrompt: prompt,
            timestamp: new Date().toISOString()
        }, null, 2);

        resultSection.style.display = 'block';
        resultSection.classList.add('fade-in');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    exportJSON() {
        const formData = this.getFormData();
        const exportData = {
            metadata: this.xmlData.metadata,
            formData: formData,
            generatedPrompt: this.compilePrompt(formData),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metaprompt_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MetapromptGenerator();
});