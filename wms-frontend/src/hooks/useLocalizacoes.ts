import { useState, useEffect, useCallback, useRef } from "react";
import { buscarLocalizacoes, buscarConsultaEstoque } from "../services/API";

export interface LocalizacaoComQtd {
	localizacao_id: number;
	nome: string;
	tipo: string;
	tipo_localizacao_id: number;
	armazem: string;
	armazem_id: number;
	ean: string;
	total_produtos: number;
}

interface UseLocalizacoesReturn {
	localizacoes: LocalizacaoComQtd[];
	loading: boolean;
	error: string | null;
	totalItems: number;
	refresh: () => Promise<void>;
	loadPage: (
		page: number,
		limit: number,
		search?: string,
		filters?: { tipoId?: number; armazemId?: number }
	) => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
	data: LocalizacaoComQtd[];
	timestamp: number;
	totalItems: number;
}

const cache = new Map<string, CacheEntry>();

export const useLocalizacoes = (): UseLocalizacoesReturn => {
	const [localizacoes, setLocalizacoes] = useState<LocalizacaoComQtd[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalItems, setTotalItems] = useState(0);

	const abortControllerRef = useRef<AbortController | null>(null);

	const generateCacheKey = useCallback(
		(
			page: number,
			limit: number,
			search?: string,
			filters?: { tipoId?: number; armazemId?: number }
		) => {
			const filterStr = filters ? JSON.stringify(filters) : "";
			return `localizacoes_${page}_${limit}_${search || ""}_${filterStr}`;
		},
		[]
	);

	const isCacheValid = useCallback((entry: CacheEntry) => {
		return Date.now() - entry.timestamp < CACHE_DURATION;
	}, []);

	const loadPage = useCallback(
		async (
			page: number = 1,
			limit: number = 100,
			search?: string,
			filters?: { tipoId?: number; armazemId?: number }
		) => {
			try {
				setLoading(true);
				setError(null);

				// Cancelar requisição anterior se existir
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
				}

				abortControllerRef.current = new AbortController();
				const cacheKey = generateCacheKey(page, limit, search, filters);

				// Verificar cache
				const cached = cache.get(cacheKey);
				if (cached && isCacheValid(cached)) {
					setLocalizacoes(cached.data);
					setTotalItems(cached.totalItems);
					setLoading(false);
					return;
				}

				const offset = (page - 1) * limit;

				// Carregar dados em paralelo
				const [localizacoesRes, estoqueRes] = await Promise.all([
					buscarLocalizacoes(
						limit,
						offset,
						search,
						filters?.armazemId,
						filters?.tipoId
					),
					buscarConsultaEstoque(),
				]);

				// Gerar mapa de estoque otimizado
				const mapaEstoque = estoqueRes.reduce(
					(acc: Record<number, number>, item: any) => {
						if (item.localizacao_id) {
							acc[item.localizacao_id] =
								(acc[item.localizacao_id] || 0) + (item.quantidade || 0);
						}
						return acc;
					},
					{}
				);

				const locsComQtd: LocalizacaoComQtd[] = localizacoesRes.results.map(
					(l: any) => ({
						...l,
						total_produtos: mapaEstoque[l.localizacao_id] || 0,
					})
				);

				// Atualizar cache
				cache.set(cacheKey, {
					data: locsComQtd,
					timestamp: Date.now(),
					totalItems: localizacoesRes.total,
				});

				setLocalizacoes(locsComQtd);
				setTotalItems(localizacoesRes.total);
			} catch (err) {
				if (err instanceof Error && err.name !== "AbortError") {
					console.error("Erro ao carregar localizações →", err);
					setError("Erro ao carregar localizações. Tente novamente.");
				}
			} finally {
				setLoading(false);
			}
		},
		[generateCacheKey, isCacheValid]
	);

	const refresh = useCallback(async () => {
		// Limpar cache
		cache.clear();
		await loadPage(1, 100);
	}, [loadPage]);

	// Carregamento inicial
	useEffect(() => {
		loadPage(1, 100);
	}, [loadPage]);

	// Cleanup no unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return {
		localizacoes,
		loading,
		error,
		totalItems,
		refresh,
		loadPage,
	};
};
