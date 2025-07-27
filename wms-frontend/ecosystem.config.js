module.exports = {
	apps: [
		{
			name: "wms-frontend",
			script: "npx", // Usa o npx para executar pacotes locais
			args: "serve -s build -l 3000", // Mesmo comando que você já usa
			cwd: "/root/wms/wms-frontend", // Ajuste para o path do seu frontend
			exec_mode: "fork", // Não precisa de cluster para frontend estático
			instances: 1, // Apenas uma instância
			autorestart: true,
			watch: false,
			max_memory_restart: "500M", // Frontend geralmente usa menos memória
			env: {
				NODE_ENV: "production",
				BROWSER: "none", // Evita abrir navegador automaticamente
				PORT: 3000, // Garante a porta mesmo se não especificada nos args
			},
			combine_logs: true,
		},
	],
};
