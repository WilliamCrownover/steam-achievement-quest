import { SteamSpyAppDetailsConverted } from "../models";

type SteamSpyAppDetailsProps = {
    ssAppDetails: SteamSpyAppDetailsConverted
}

export const SteamSpyAppDetails = (props: SteamSpyAppDetailsProps) => {
    const {
        developer,
        publisher,
        owners,
        genre,
        tags,
        languages
    } = props.ssAppDetails;

    const detailsList = (dataType: string[], label: string) => (
        <>
            {dataType.length > 0 &&
                <div className='gameStoreDetailContainer'>
                    <h4 className='gameStoreDetailDataPoint'>{label}:</h4>
                    {dataType.map((string, index) =>
                        <h4 className='gameStoreDetailDataPoint' key={index}>{string}</h4>
                    )}
                </div>
            }
        </>
    )

    return (
        <div>
            {detailsList(developer, 'Developers')}
            {detailsList(publisher, 'Publishers')}
            {owners &&
                <div className='gameStoreDetailContainer'>
                    <h4 className='gameStoreDetailDataPoint'>Owners:</h4>
                    <h4 className='gameStoreDetailDataPoint' key={'owners'}>{owners}</h4>
                </div>
            }
            {detailsList(genre, 'Genres')}
            {detailsList(tags, 'Tags')}
            {detailsList(languages, 'Languages')}
        </div>
    )
}