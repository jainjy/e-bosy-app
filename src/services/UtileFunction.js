
	//fonction rechercher
	export const rechercher = (val,setSearchMot,getFetch,setValeur) => {
		setSearchMot(val);
		const filterValeur = origin.filter((item) =>
			item.title.toLowerCase().includes(val.toLowerCase())
		);
		setValeur(filterValeur);
		if(val===''){
			getFetch()
		}
	};
